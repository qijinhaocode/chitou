import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import type { EvaluationResult } from "@/types"

const client = new Anthropic() // reads ANTHROPIC_API_KEY from env

// ── Tool schema that forces Claude to return structured scores ────────────────

const EVALUATE_TOOL: Anthropic.Tool = {
  name: "submit_evaluation",
  description:
    "Submit the multi-dimensional evaluation result for the candidate's answer.",
  input_schema: {
    type: "object" as const,
    properties: {
      overallScore: {
        type: "number",
        description: "Weighted overall score 0–100.",
      },
      accuracyScore: {
        type: "number",
        description: "概念准确度 (Concept Accuracy) 0–100. How correct are the core concepts?",
      },
      completenessScore: {
        type: "number",
        description: "细节完备性 (Detail Completeness) 0–100. How thoroughly are key details covered?",
      },
      logicScore: {
        type: "number",
        description: "表达逻辑性 (Logical Expression) 0–100. How clearly and logically is the answer structured?",
      },
      masteryLevel: {
        type: "string",
        enum: ["excellent", "good", "partial", "poor"],
        description: "Holistic mastery level: excellent ≥85, good ≥70, partial ≥50, poor <50.",
      },
      aiFeedback: {
        type: "string",
        description: "2–4 sentences in Chinese praising what the candidate got right.",
      },
      aiSuggestion: {
        type: "string",
        description: "2–4 concrete, actionable sentences in Chinese on how to improve.",
      },
      suggestedRating: {
        type: "number",
        enum: [1, 2, 3, 4],
        description: "FSRS self-rating suggestion: 1=Again, 2=Hard, 3=Good, 4=Easy.",
      },
    },
    required: [
      "overallScore",
      "accuracyScore",
      "completenessScore",
      "logicScore",
      "masteryLevel",
      "aiFeedback",
      "aiSuggestion",
      "suggestedRating",
    ],
    additionalProperties: false,
  },
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM = `你是【吃透】AI 面试教练，专为高级技术岗位面试评估设计。
你的职责是严格、客观地评估候选人的书面回答，从三个维度打分：
1. 概念准确度 (Accuracy)：核心概念是否正确，有无事实错误。
2. 细节完备性 (Completeness)：关键细节、边界条件、复杂度等是否覆盖。
3. 表达逻辑性 (Logic)：回答是否层次清晰、论据充分、条理分明。

评分标准：
- 90–100：接近完美，面试现场可直接给出此回答。
- 75–89：整体良好，细节稍有欠缺。
- 60–74：方向正确，但遗漏较多关键信息。
- 40–59：部分理解，有明显的概念错误或重大遗漏。
- <40：基本不理解该知识点。

overallScore = accuracyScore * 0.4 + completenessScore * 0.35 + logicScore * 0.25 （四舍五入取整）

反馈语言：中文，语气专业而鼓励，直击要点，不超过4句话。`

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { question, referenceAnswer, userAnswer } = await req.json()

  if (!question || !referenceAnswer || !userAnswer) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  // Fall back to mock when no API key is configured (local dev without key)
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(mockEvaluate(userAnswer, referenceAnswer))
  }

  try {
    // Stream internally; tool_choice forces a single structured tool call.
    // .finalMessage() collects the complete message after the stream finishes.
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM,
      tools: [EVALUATE_TOOL],
      tool_choice: { type: "tool", name: "submit_evaluation" },
      messages: [
        {
          role: "user",
          content: `## 题目\n${question}\n\n## 参考答案\n${referenceAnswer}\n\n## 候选人回答\n${userAnswer}`,
        },
      ],
    })

    const message = await stream.finalMessage()

    // Extract the tool call input — guaranteed to exist because tool_choice forced it
    const toolBlock = message.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    )

    if (!toolBlock) {
      throw new Error("Model did not return a tool call")
    }

    const result = toolBlock.input as EvaluationResult
    return NextResponse.json(result)

  } catch (err) {
    console.error("[evaluate] Anthropic API error:", err)
    // Graceful fallback — never leave the user stuck on the loading spinner
    return NextResponse.json(mockEvaluate(userAnswer, referenceAnswer))
  }
}

// ── Mock fallback (used when ANTHROPIC_API_KEY is absent or on API error) ─────

function mockEvaluate(userAnswer: string, referenceAnswer: string): EvaluationResult {
  const coverageRatio = Math.min(
    userAnswer.trim().length / Math.max(referenceAnswer.trim().length, 1),
    1
  )
  const base = Math.round(40 + coverageRatio * 45)
  const jitter = () => Math.round((Math.random() - 0.5) * 14)

  const accuracyScore     = Math.min(100, Math.max(20, base + 5  + jitter()))
  const completenessScore = Math.min(100, Math.max(20, base - 8  + jitter()))
  const logicScore        = Math.min(100, Math.max(20, base + 2  + jitter()))
  const overallScore      = Math.round(
    accuracyScore * 0.4 + completenessScore * 0.35 + logicScore * 0.25
  )

  const masteryLevel =
    overallScore >= 85 ? "excellent"
    : overallScore >= 70 ? "good"
    : overallScore >= 50 ? "partial"
    : "poor"

  const COPY: Record<string, { fb: string; sug: string }> = {
    excellent: {
      fb:  "回答全面准确，核心概念掌握扎实，逻辑清晰流畅。完全达到面试水准。",
      sug: "继续保持！可尝试用更简洁的语言表达，或补充真实的工程场景案例。",
    },
    good: {
      fb:  "整体方向正确，覆盖了大部分核心要点，表达逻辑较为清晰。",
      sug: "补充关键细节（边界条件、复杂度分析等）会让回答更完备。",
    },
    partial: {
      fb:  "回答涉及了部分核心概念，但存在遗漏或不够准确的地方。",
      sug: "对照参考答案中你未提到的部分，理解 why 而不是记住 what。",
    },
    poor: {
      fb:  "对这个知识点的掌握还比较薄弱，需要重新系统学习。",
      sug: "先精读参考答案，理解每步原理，再用自己的话完整复述一遍。",
    },
  }

  return {
    overallScore,
    accuracyScore,
    completenessScore,
    logicScore,
    masteryLevel: masteryLevel as EvaluationResult["masteryLevel"],
    aiFeedback:   COPY[masteryLevel].fb,
    aiSuggestion: COPY[masteryLevel].sug,
    suggestedRating: (
      overallScore >= 85 ? 4 : overallScore >= 70 ? 3 : overallScore >= 50 ? 2 : 1
    ) as EvaluationResult["suggestedRating"],
  }
}
