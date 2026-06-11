import { prisma } from "@/lib/db/prisma"
import { getDemoUserId } from "@/lib/db/demo"
import { deriveMasteryStatus } from "@/lib/utils"
import { PracticeSession } from "@/components/practice/PracticeSession"
import type { Card } from "@/types"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export const revalidate = 0

export default async function PracticeSessionPage() {
  const userId = await getDemoUserId()
  const now    = new Date()

  // Load due cards, fallback to newest if nothing is due yet
  let dbCards = await prisma.card.findMany({
    where:   { userId, due: { lte: now } },
    orderBy: { due: "asc" },
    take:    20,
  })

  if (dbCards.length === 0) {
    dbCards = await prisma.card.findMany({
      where:   { userId },
      orderBy: { createdAt: "asc" },
      take:    6,
    })
  }

  if (dbCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
        <p className="text-lg font-semibold text-foreground">题库是空的</p>
        <p className="text-sm text-muted-foreground">先去知识储备库添加一些卡片吧。</p>
        <Link href="/library" className={buttonVariants()}>前往知识储备库</Link>
      </div>
    )
  }

  const cards: Card[] = dbCards.map(c => ({
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
                       c.fsrsState as Card["fsrsState"], c.reps, c.lastScore
                     ),
    lastScore:       c.lastScore,
    createdAt:       c.createdAt.toISOString(),
    updatedAt:       c.updatedAt.toISOString(),
  }))

  return (
    <div className="h-full">
      <PracticeSession cards={cards} />
    </div>
  )
}
