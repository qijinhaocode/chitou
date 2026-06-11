import { NextRequest, NextResponse } from "next/server"
import type { EvaluationResult } from "@/types"

/**
 * Mock evaluation endpoint — Step 3.
 * Step 4 will replace this with a real streaming Anthropic call.
 *
 * The mock is deterministic based on answer length so manual testing
 * produces varied, realistic-looking results.
 */

export async function POST(req: NextRequest) {
  const { question, referenceAnswer, userAnswer } = await req.json()

  if (!question || !referenceAnswer || !userAnswer) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  // Simulate LLM latency
  await new Promise((r) => setTimeout(r, 1800))

  const result = mockEvaluate(userAnswer, referenceAnswer)
  return NextResponse.json(result)
}

function mockEvaluate(userAnswer: string, referenceAnswer: string): EvaluationResult {
  const userLen = userAnswer.trim().length
  const refLen = referenceAnswer.trim().length
  const coverageRatio = Math.min(userLen / Math.max(refLen, 1), 1)

  // Base scores influenced by coverage & length
  const base = Math.round(40 + coverageRatio * 45)
  const noise = () => Math.round((Math.random() - 0.5) * 14)

  const accuracyScore    = Math.min(100, Math.max(20, base + 5  + noise()))
  const completenessScore = Math.min(100, Math.max(20, base - 8 + noise()))
  const logicScore        = Math.min(100, Math.max(20, base + 2  + noise()))
  const overallScore      = Math.round((accuracyScore + completenessScore + logicScore) / 3)

  const masteryLevel =
    overallScore >= 85 ? "excellent"
    : overallScore >= 70 ? "good"
    : overallScore >= 50 ? "partial"
    : "poor"

  const suggestedRating: 1 | 2 | 3 | 4 =
    overallScore >= 85 ? 4
    : overallScore >= 70 ? 3
    : overallScore >= 50 ? 2
    : 1

  const feedbacks: Record<string, { fb: string; sug: string }> = {
    excellent: {
      fb: "回答全面准确，核心概念掌握扎实，逻辑清晰流畅。完全达到面试水准。",
      sug: "继续保持！可尝试用更简洁的语言表达，或加入真实的工程场景案例。",
    },
    good: {
      fb: "整体方向正确，覆盖了大部分核心要点，表达逻辑较为清晰。",
      sug: "补充一些关键细节（如边界条件、时间复杂度分析），会让回答更完备。",
    },
    partial: {
      fb: "回答涉及了部分核心概念，但存在一些遗漏或不够准确的地方。",
      sug: "重点对照参考答案中你没有提到的部分，理解 why 而不是记住 what。",
    },
    poor: {
      fb: "对这个知识点的掌握还比较薄弱，需要重新系统学习。",
      sug: "先精读参考答案，理解每一步的原理，再用自己的话默写一遍。",
    },
  }

  const { fb: aiFeedback, sug: aiSuggestion } = feedbacks[masteryLevel]

  return {
    overallScore,
    accuracyScore,
    completenessScore,
    logicScore,
    masteryLevel,
    aiFeedback,
    aiSuggestion,
    suggestedRating,
  }
}
