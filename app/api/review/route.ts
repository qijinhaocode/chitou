import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getDemoUserId } from "@/lib/db/demo"
import type { EvaluationResult, FSRSRating } from "@/types"

interface ReviewPayload {
  cardId: string
  userAnswer: string
  evaluation: EvaluationResult
  rating: FSRSRating
  fsrsStateBefore: {
    state: string
    stability: number
    difficulty: number
    due: string
  }
}

export async function POST(req: NextRequest) {
  const userId = await getDemoUserId()
  const body: ReviewPayload = await req.json()

  const log = await prisma.reviewLog.create({
    data: {
      cardId:            body.cardId,
      userId,
      userAnswer:        body.userAnswer,
      overallScore:      body.evaluation.overallScore,
      accuracyScore:     body.evaluation.accuracyScore,
      completenessScore: body.evaluation.completenessScore,
      logicScore:        body.evaluation.logicScore,
      aiFeedback:        body.evaluation.aiFeedback,
      aiSuggestion:      body.evaluation.aiSuggestion,
      rating:            body.rating,
      fsrsStateBefore:   body.fsrsStateBefore,
    },
  })

  return NextResponse.json({ id: log.id }, { status: 201 })
}
