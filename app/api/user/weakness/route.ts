import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/db/prisma"
import { getDemoUserId } from "@/lib/db/demo"

const client = new Anthropic()

const ANALYZE_TOOL: Anthropic.Tool = {
  name: "report_weaknesses",
  description: "Report the user's learning weak points based on their review history.",
  input_schema: {
    type: "object" as const,
    properties: {
      weakPoints: {
        type: "array",
        description: "Top 2–3 specific weak concepts (most urgent first)",
        items: {
          type: "object",
          properties: {
            concept:  { type: "string", description: "Specific concept name, e.g. '时间复杂度分析'" },
            category: { type: "string", description: "Category: algorithm/system_design/etc." },
            avgScore: { type: "number", description: "Average score 0-100 on this concept" },
            reason:   { type: "string", description: "1 sentence: why the user struggles here" },
            action:   { type: "string", description: "1 concrete action to improve this week" },
          },
          required: ["concept", "category", "avgScore", "reason", "action"],
          additionalProperties: false,
        },
      },
      weekSummary: { type: "string", description: "2-sentence overall assessment of this week's study" },
      topPriority: { type: "string", description: "The single most important thing to focus on this week" },
      overallTrend: {
        type: "string",
        enum: ["improving", "stable", "declining"],
        description: "Is performance trending up, flat, or down?",
      },
    },
    required: ["weakPoints", "weekSummary", "topPriority", "overallTrend"],
    additionalProperties: false,
  },
}

export async function GET() {
  const userId = await getDemoUserId()
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Fetch last 7 days of reviews with their card title
  const logs = await prisma.reviewLog.findMany({
    where:   { userId, reviewedAt: { gte: sevenDaysAgo } },
    include: { card: { select: { title: true, category: true } } },
    orderBy: { reviewedAt: "asc" },
  })

  if (logs.length === 0) {
    return NextResponse.json({ empty: true })
  }

  // Build a compact data summary for Claude (avoid sending full answers)
  const summary = logs.map(l => ({
    title:      l.card.title,
    category:   l.card.category,
    overall:    l.overallScore,
    accuracy:   l.accuracyScore,
    completeness: l.completenessScore,
    logic:      l.logicScore,
    date:       l.reviewedAt.toISOString().slice(0, 10),
  }))

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(mockAnalysis(summary))
  }

  try {
    const stream = client.messages.stream({
      model:       "claude-sonnet-4-6",
      max_tokens:  1024,
      tools:       [ANALYZE_TOOL],
      tool_choice: { type: "tool", name: "report_weaknesses" },
      system: `你是【吃透】AI 学习教练，专注于分析用户的技术面试备考弱点。
根据用户最近7天的复习记录，识别知识薄弱点并给出具体改进建议。
分析要聚焦、实用，避免泛泛而谈。`,
      messages: [{
        role: "user",
        content: `用户最近7天的复习记录（共${logs.length}次）：\n\n${JSON.stringify(summary, null, 2)}\n\n请分析薄弱点。`,
      }],
    })

    const message = await stream.finalMessage()
    const toolBlock = message.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    )
    if (!toolBlock) throw new Error("no tool call")

    return NextResponse.json(toolBlock.input)
  } catch {
    return NextResponse.json(mockAnalysis(summary))
  }
}

function mockAnalysis(summary: Array<{ category: string; overall: number; title: string }>) {
  // Group by category and find lowest avg
  const byCategory: Record<string, number[]> = {}
  for (const s of summary) {
    if (!byCategory[s.category]) byCategory[s.category] = []
    byCategory[s.category].push(s.overall)
  }
  const sorted = Object.entries(byCategory)
    .map(([cat, scores]) => ({ cat, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
    .sort((a, b) => a.avg - b.avg)

  return {
    weakPoints: sorted.slice(0, 2).map(({ cat, avg }) => ({
      concept:  `${cat} 相关知识点`,
      category: cat,
      avgScore: Math.round(avg),
      reason:   "答案细节覆盖不够全面，存在关键概念遗漏",
      action:   "精读参考答案，重点理解 why 而不是记住 what",
    })),
    weekSummary:  `本周共完成 ${summary.length} 次复习，整体表现尚可，但部分知识点有待深化。`,
    topPriority:  sorted[0] ? `重点补强 ${sorted[0].cat} 类题目，当前平均分 ${Math.round(sorted[0].avg)} 分` : "继续保持当前学习节奏",
    overallTrend: "stable" as const,
  }
}
