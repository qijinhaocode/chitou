import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getDemoUserId } from "@/lib/db/demo"
import type { CardCategory } from "@/types"

export async function POST(req: NextRequest) {
  const userId = await getDemoUserId()
  const { cards } = await req.json()

  if (!Array.isArray(cards) || cards.length === 0) {
    return NextResponse.json({ error: "No cards provided" }, { status: 400 })
  }

  const created = await Promise.all(
    cards.map((c: {
      title: string
      question: string
      referenceAnswer: string
      category: string
      difficulty: number
      tags: string[]
    }) =>
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
        select: { id: true, title: true },
      })
    )
  )

  return NextResponse.json({ count: created.length, cards: created }, { status: 201 })
}
