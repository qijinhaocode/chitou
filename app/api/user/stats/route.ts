import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getDemoUserId } from "@/lib/db/demo"
import { learningVelocity, estimateDaysToGoal } from "@/lib/algorithms/bkt"
import type { UserStats } from "@/types"

export async function GET() {
  const userId = await getDemoUserId()
  const now    = new Date()
  const today  = new Date(now); today.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const fourteenDaysAgo = new Date(today); fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const [cards, reviewsRecent, reviewsToday] = await Promise.all([
    prisma.card.findMany({ where: { userId }, select: { masteryStatus: true, lastScore: true, due: true } }),
    prisma.reviewLog.findMany({
      where: { userId, reviewedAt: { gte: fourteenDaysAgo } },
      select: { overallScore: true, reviewedAt: true },
      orderBy: { reviewedAt: "asc" },
    }),
    prisma.reviewLog.findMany({
      where: { userId, reviewedAt: { gte: today } },
      select: { id: true },
    }),
  ])

  const totalCards     = cards.length
  const masteredCount  = cards.filter(c => c.masteryStatus === "mastered").length
  const digestingCount = cards.filter(c => c.masteryStatus === "digesting").length
  const pendingCount   = cards.filter(c => c.masteryStatus === "pending").length
  const dueToday       = cards.filter(c => c.due <= now).length
  const completedToday = reviewsToday.length
  const masteryRate    = totalCards > 0 ? masteredCount / totalCards : 0

  // BKT velocity from last 14 days
  const reviewHistory = reviewsRecent.map(r => ({
    date:  r.reviewedAt.toISOString().slice(0, 10),
    score: r.overallScore,
  }))
  const velocity = learningVelocity(reviewHistory)
  const estimatedDaysToGoal = estimateDaysToGoal(masteryRate, velocity)

  // Daily average over last 7 days
  const avgDailyProgress = reviewsRecent.length / 7

  // Streak: consecutive days with at least 1 review
  const reviewDays = new Set(reviewHistory.map(r => r.date))
  let streak = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (reviewDays.has(d.toISOString().slice(0, 10))) streak++
    else break
  }

  const stats: UserStats = {
    totalCards, masteredCount, digestingCount, pendingCount,
    dueToday, completedToday, avgDailyProgress,
    estimatedDaysToGoal, masteryRate, streak,
  }

  return NextResponse.json(stats)
}
