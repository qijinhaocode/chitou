import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/db/prisma"
import { getDemoUserId } from "@/lib/db/demo"
import type { CardCategory } from "@/types"

const client = new Anthropic()

// ── Extraction tool schema ────────────────────────────────────────────────────

const EXTRACT_TOOL: Anthropic.Tool = {
  name: "save_knowledge_cards",
  description: "Save the extracted atomic knowledge cards to the user's study library.",
  input_schema: {
    type: "object" as const,
    properties: {
      cards: {
        type: "array",
        description: "Atomic knowledge cards extracted from the document. 5–15 cards.",
        items: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Short, specific question title (≤50 chars). E.g. '解释 TCP 三次握手'",
            },
            question: {
              type: "string",
              description: "Full question as asked in a technical interview (1–3 sentences).",
            },
            referenceAnswer: {
              type: "string",
              description: "Concise model answer (150–500 chars). Include key terms and reasoning.",
            },
            category: {
              type: "string",
              enum: ["algorithm", "system_design", "behavioral", "language", "database", "network", "os", "custom"],
            },
            difficulty: {
              type: "integer",
              enum: [1, 2, 3, 4, 5],
              description: "1 = basic recall, 5 = deep expertise required",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "2–4 concise tags (e.g. ['TCP', '网络', '握手'])",
            },
          },
          required: ["title", "question", "referenceAnswer", "category", "difficulty", "tags"],
          additionalProperties: false,
        },
      },
    },
    required: ["cards"],
    additionalProperties: false,
  },
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM = `你是【吃透】AI 知识萃取引擎，专为高级技术岗位面试备考设计。

任务：阅读用户提供的文档（简历、面经、技术文档、学习笔记等），从中提取 5–15 张原子化知识卡片。

原子化原则（最小信息原则）：
- 每张卡片只考察一个独立知识点
- 问题具体、明确，可以直接在面试中使用
- 答案简洁有力，直击核心，不超过 500 字

提取策略：
- 简历类：将候选人描述的技术栈转化为面试官会追问的深度问题
- 面经类：提取每个问题背后的核心知识点，补充完整的参考答案
- 技术文档：提取核心概念、底层原理、使用场景与对比

质量标准：
- 优先技术深度强、面试高频考察的内容
- 避免纯记忆性、过于宽泛或重复的问题
- 参考答案必须准确，包含必要的技术细节

直接调用 save_knowledge_cards 工具，不要输出其他文字。`

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file     = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 })
  }

  const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf")

  // ── Build the user message ────────────────────────────────────────────────
  let userContent: Anthropic.MessageParam["content"]

  if (isPDF) {
    const bytes  = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    userContent = [
      {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      } as Anthropic.DocumentBlockParam,
      { type: "text", text: `请从这份文档中提取面试备考知识卡片。文件名：${file.name}` },
    ]
  } else {
    const text = await file.text()
    if (text.trim().length < 50) {
      return NextResponse.json({ error: "Document too short" }, { status: 400 })
    }
    userContent = `请从以下文档中提取面试备考知识卡片。\n\n文件名：${file.name}\n\n---\n\n${text.slice(0, 80_000)}`
  }

  // ── Fall back to mock if no API key ──────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    const mock = buildMockCards(file.name)
    const userId = await getDemoUserId()
    const saved  = await saveCards(userId, mock)
    return NextResponse.json({ cards: saved, source: "mock" })
  }

  try {
    const stream = client.messages.stream({
      model:        "claude-sonnet-4-6",
      max_tokens:   4096,
      system:       SYSTEM,
      tools:        [EXTRACT_TOOL],
      tool_choice:  { type: "tool", name: "save_knowledge_cards" },
      messages:     [{ role: "user", content: userContent }],
    })

    const message = await stream.finalMessage()
    const toolBlock = message.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    )

    if (!toolBlock) {
      throw new Error("No tool call returned")
    }

    const raw = toolBlock.input as Record<string, unknown>
    const extracted = Array.isArray(raw.cards) ? raw.cards as Array<{
      title: string
      question: string
      referenceAnswer: string
      category: string
      difficulty: number
      tags: string[]
    }> : []

    if (extracted.length === 0) {
      console.error("[import] tool input had no cards array:", JSON.stringify(raw).slice(0, 300))
      throw new Error("No cards extracted from document")
    }

    const userId = await getDemoUserId()
    const saved  = await saveCards(userId, extracted)

    return NextResponse.json({ cards: saved, source: "claude" })

  } catch (err) {
    console.error("[import] extraction error:", err)
    // Graceful fallback
    const mock   = buildMockCards(file.name)
    const userId = await getDemoUserId()
    const saved  = await saveCards(userId, mock)
    return NextResponse.json({ cards: saved, source: "fallback" })
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function saveCards(
  userId: string,
  cards: Array<{
    title: string
    question: string
    referenceAnswer: string
    category: string
    difficulty: number
    tags: string[]
  }>
) {
  const created = await Promise.all(
    cards.map((c) =>
      prisma.card.create({
        data: {
          userId,
          title:           c.title,
          question:        c.question,
          referenceAnswer: c.referenceAnswer,
          category:        (c.category as CardCategory) ?? "custom",
          difficulty:      Math.min(5, Math.max(1, c.difficulty)) as 1|2|3|4|5,
          tags:            c.tags ?? [],
          due:             new Date(),
        },
        select: { id: true, title: true, category: true, difficulty: true },
      })
    )
  )
  return created
}

function buildMockCards(fileName: string) {
  return [
    {
      title:           "什么是 HTTP/2 的多路复用？",
      question:        "HTTP/2 相比 HTTP/1.1 的主要改进是什么？多路复用解决了什么问题？",
      referenceAnswer: "HTTP/2 引入多路复用（Multiplexing），允许在单个 TCP 连接上并行传输多个请求/响应，解决了 HTTP/1.1 的队头阻塞问题。通过二进制分帧（Frame）和流（Stream）机制，不同请求的帧可以交错传输，大幅提升并发性能。",
      category:        "network",
      difficulty:      3,
      tags:            ["HTTP/2", "网络", "多路复用"],
    },
    {
      title:           `从 ${fileName.replace(/\.[^.]+$/, "")} 提取的示例卡片`,
      question:        "（真实使用时，此处会是从文档中提取的具体技术问题）",
      referenceAnswer: "配置 ANTHROPIC_API_KEY 后，Claude 会从你的真实文档中提取知识卡片。",
      category:        "custom",
      difficulty:      1,
      tags:            ["示例"],
    },
  ]
}
