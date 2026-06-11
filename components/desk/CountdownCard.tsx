"use client"

import { motion } from "framer-motion"
import { CalendarDays, TrendingUp, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface CountdownCardProps {
  etaDays: number          // BKT estimate; -1 = can't estimate
  streak: number           // consecutive study days
  avgDailyProgress: number // avg cards completed per day (last 7 days)
  targetDate: string | null // ISO date string or null
}

function etaColor(days: number): string {
  if (days <= 0)   return "text-emerald-500"
  if (days <= 14)  return "text-primary"
  if (days <= 30)  return "text-amber-500"
  return "text-foreground"
}

export function CountdownCard({ etaDays, streak, avgDailyProgress, targetDate }: CountdownCardProps) {
  const daysUntilTarget = targetDate
    ? Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4"
    >
      {/* BKT ETA */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            AI 预估达标
          </p>
        </div>
        <div className="flex items-baseline gap-1.5">
          {etaDays > 0 ? (
            <>
              <span className={cn("text-3xl font-bold tabular-nums", etaColor(etaDays))}>
                {etaDays}
              </span>
              <span className="text-sm text-muted-foreground">天后达到 85% 掌握度</span>
            </>
          ) : etaDays === 0 ? (
            <span className="text-lg font-semibold text-emerald-500">目标已达成！🎉</span>
          ) : (
            <span className="text-sm text-muted-foreground">数据积累中，继续练习…</span>
          )}
        </div>
      </div>

      <div className="h-px bg-border/60" />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">连续打卡</p>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums">
            {streak} <span className="text-xs font-normal text-muted-foreground">天</span>
          </p>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">日均复习</p>
          </div>
          <p className="text-xl font-bold text-foreground tabular-nums">
            {avgDailyProgress.toFixed(1)}{" "}
            <span className="text-xs font-normal text-muted-foreground">张/天</span>
          </p>
        </div>
      </div>

      {/* Target date row */}
      {daysUntilTarget !== null && (
        <>
          <div className="h-px bg-border/60" />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">目标面试日期</p>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-sm font-semibold tabular-nums",
                daysUntilTarget <= etaDays && etaDays > 0 ? "text-amber-500" : "text-foreground"
              )}>
                {daysUntilTarget > 0 ? `还有 ${daysUntilTarget} 天` : "今天！"}
              </span>
              {daysUntilTarget <= etaDays && etaDays > 0 && (
                <span className="text-[10px] text-amber-500 font-medium">⚠ 需提速</span>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
