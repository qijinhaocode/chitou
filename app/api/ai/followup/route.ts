import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import type { EvaluationResult } from "@/types"

const client = new Anthropic()

const FOLLOWUP_TOOL: Anthropic.Tool = {
  name: "ask_followup",
  description: "Ask one targeted follow-up question to probe the candidate's weak spot.",
  input_schema: {
    type: "object" as const,
    properties: {
      question: {
        type: "string",
        description: "One sharp follow-up question (1-2 sentences) targeting the weakest dimension of their answer.",
      },
      hint: {
        type: "string",
        description: "A 1-sentence hint about what aspect to focus on (shown to user below the question).",
      },
    },
    required: ["question", "hint"],
    additionalProperties: false,
  },
}

export async function POST(req: NextRequest) {
  const { question, referenceAnswer, userAnswer, evaluation } = await req.json() as {
    question:        string
    referenceAnswer: string
    userAnswer:      string
    evaluation:      EvaluationResult
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(mockFollowup(evaluation))
  }

  try {
    const weakDimension = getWeakDimension(evaluation)

    const stream = client.messages.stream({
      model:       "claude-sonnet-4-6",
      max_tokens:  512,
      tools:       [FOLLOWUP_TOOL],
      tool_choice: { type: "tool", name: "ask_followup" },
      system: `你是一位严格的技术面试官，正在对候选人进行深度追问。
候选人刚刚回答了一道题，你需要针对其回答最薄弱的维度（${weakDimension}）提出一个追问。
追问要求：
- 针对候选人答案中最模糊或缺失的具体技术点
- 不能重复原题，要深挖
- 用中文，专业且直接`,
      messages: [{
        role: "user",
        content: `原题：${question}

参考答案要点：${referenceAnswer.slice(0, 600)}

候选人的回答：${userAnswer.slice(0, 400)}

评分结果：准确度 ${evaluation.accuracyScore}，完备性 ${evaluation.completenessScore}，逻辑性 ${evaluation.logicScore}

请针对最薄弱的地方追问一个深度问题。`,
      }],
    })

    const message = await stream.finalMessage()
    const toolBlock = message.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    )

    if (!toolBlock) throw new Error("No tool call")

    return NextResponse.json(toolBlock.input)
  } catch {
    return NextResponse.json(mockFollowup(evaluation))
  }
}

function getWeakDimension(ev: EvaluationResult): string {
  const dims = [
    { name: "概念准确度", score: ev.accuracyScore },
    { name: "细节完备性", score: ev.completenessScore },
    { name: "表达逻辑性", score: ev.logicScore },
  ]
  return dims.sort((a, b) => a.score - b.score)[0].name
}

function mockFollowup(ev: EvaluationResult) {
  const weak = getWeakDimension(ev)
  return {
    question: `你的回答在「${weak}」方面还不够深入——能展开说说具体的实现机制或边界条件吗？`,
    hint: `聚焦在你之前没有详细展开的技术细节上`,
  }
}
