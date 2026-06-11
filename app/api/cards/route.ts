import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getDemoUserId } from "@/lib/db/demo"
import { deriveMasteryStatus } from "@/lib/utils"
import type { Card } from "@/types"

export async function GET(req: NextRequest) {
  const userId = await getDemoUserId()
  const due = req.nextUrl.searchParams.get("due") === "today"

  const cards = await prisma.card.findMany({
    where: {
      userId,
      ...(due ? { due: { lte: new Date() } } : {}),
    },
    orderBy: { due: "asc" },
  })

  const result: Card[] = cards.map((c) => ({
    id:              c.id,
    userId:          c.userId,
    title:           c.title,
    question:        c.question,
    referenceAnswer: c.referenceAnswer,
    tags:            c.tags,
    category:        c.category as Card["category"],
    difficulty:      c.difficulty as Card["difficulty"],
    fsrsState:       c.fsrsState as Card["fsrsState"],
    stability:       c.stability,
    fsrsDifficulty:  c.fsrsDifficulty,
    elapsedDays:     c.elapsedDays,
    scheduledDays:   c.scheduledDays,
    reps:            c.reps,
    lapses:          c.lapses,
    due:             c.due.toISOString(),
    masteryStatus:   deriveMasteryStatus(
                       c.fsrsState as Card["fsrsState"],
                       c.reps,
                       c.lastScore
                     ),
    lastScore:       c.lastScore,
    createdAt:       c.createdAt.toISOString(),
    updatedAt:       c.updatedAt.toISOString(),
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const userId = await getDemoUserId()
  const body = await req.json()

  const card = await prisma.card.create({
    data: {
      userId,
      title:           body.title,
      question:        body.question,
      referenceAnswer: body.referenceAnswer,
      tags:            body.tags ?? [],
      category:        body.category ?? "custom",
      difficulty:      body.difficulty ?? 3,
    },
  })

  return NextResponse.json({ id: card.id }, { status: 201 })
}
