import { prisma } from "@/lib/db/prisma"
import { getDemoUserId } from "@/lib/db/demo"
import { deriveMasteryStatus } from "@/lib/utils"
import { learningVelocity, estimateDaysToGoal } from "@/lib/algorithms/bkt"
import { buildWeekData } from "@/lib/desk"
import { StatCard } from "@/components/desk/StatCard"
import { MasteryRing } from "@/components/desk/MasteryRing"
import { CountdownCard } from "@/components/desk/CountdownCard"
import { TodayQueue } from "@/components/desk/TodayQueue"
import { WeeklyActivity } from "@/components/desk/WeeklyActivity"
import type { Card } from "@/types"

export const revalidate = 0 // always fresh

export default async function DeskPage() {
  const userId = await getDemoUserId()
  const now    = new Date()
  const today  = new Date(now); today.setHours(0, 0, 0, 0)
  const fourteenDaysAgo = new Date(today)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  // ── Fetch all data in parallel ──────────────────────────────────────────
  const [cards, user, recentReviews] = await Promise.all([
    prisma.card.findMany({
      where:   { userId },
      orderBy: { due: "asc" },
    }),
    prisma.user.findUniqueOrThrow({
      where:  { id: userId },
      select: { targetDate: true, dailyGoal: true },
    }),
    prisma.reviewLog.findMany({
      where:   { userId, reviewedAt: { gte: fourteenDaysAgo } },
      select:  { overallScore: true, reviewedAt: true },
      orderBy: { reviewedAt: "asc" },
    }),
  ])

  // ── Compute stats ────────────────────────────────────────────────────────
  const masteredCount  = cards.filter(c => c.masteryStatus === "mastered").length
  const digestingCount = cards.filter(c => c.masteryStatus === "digesting").length
  const pendingCount   = cards.filter(c => c.masteryStatus === "pending").length
  const totalCards     = cards.length
  const masteryRate    = totalCards > 0 ? masteredCount / totalCards : 0

  const reviewHistory = recentReviews.map(r => ({
    date:  r.reviewedAt.toISOString().slice(0, 10),
    score: r.overallScore,
  }))
  const velocity = learningVelocity(reviewHistory)
  const etaDays  = estimateDaysToGoal(masteryRate, velocity)

  // Streak
  const reviewDays = new Set(reviewHistory.map(r => r.date))
  let streak = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (reviewDays.has(d.toISOString().slice(0, 10))) streak++
    else break
  }

  const avgDailyProgress = recentReviews.length / 7

  // Weekly activity counts
  const weekCounts: Record<string, number> = {}
  for (const r of recentReviews) {
    const key = r.reviewedAt.toISOString().slice(0, 10)
    weekCounts[key] = (weekCounts[key] ?? 0) + 1
  }
  const weekData = buildWeekData(weekCounts)

  // Due today — map Prisma rows → Card type
  const dueCards: Card[] = cards
    .filter(c => c.due <= now)
    .slice(0, 10)
    .map(c => ({
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

  const targetDate = user.targetDate?.toISOString().slice(0, 10) ?? null

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">

        {/* ── Row 1: 4 stat cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="总卡片"  value={totalCards}     sub="知识原子总量"   accent="stone"   delay={0}    />
          <StatCard label="已吃透"  value={masteredCount}  sub={`占比 ${totalCards > 0 ? Math.round(masteryRate * 100) : 0}%`} accent="emerald" delay={0.07} />
          <StatCard label="消化中"  value={digestingCount} sub="需持续复习"     accent="amber"   delay={0.14} />
          <StatCard label="待吃透"  value={pendingCount}   sub="尚未开始"       accent="rose"    delay={0.21} />
        </div>

        {/* ── Row 2: ring + countdown | today queue ────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <MasteryRing
                masteredCount={masteredCount}
                digestingCount={digestingCount}
                pendingCount={pendingCount}
                total={totalCards}
              />
            </div>
            <CountdownCard
              etaDays={etaDays}
              streak={streak}
              avgDailyProgress={avgDailyProgress}
              targetDate={targetDate}
            />
          </div>
          <div className="md:col-span-3">
            <TodayQueue cards={dueCards} />
          </div>
        </div>

        {/* ── Row 3: weekly activity ────────────────────────────────────── */}
        <WeeklyActivity data={weekData} />

      </div>
    </div>
  )
}
