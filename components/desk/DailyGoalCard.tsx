"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Target, Flame } from "lucide-react"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"

interface DailyGoalCardProps {
  completed: number
  goal:      number
  streak:    number
}

export function DailyGoalCard({ completed, goal, streak }: DailyGoalCardProps) {
  const pct       = goal > 0 ? Math.min(completed / goal, 1) : 0
  const isDone    = completed >= goal && goal > 0
  const firedRef  = useRef(false)

  useEffect(() => {
    if (isDone && !firedRef.current) {
      firedRef.current = true
      // Burst from both sides
      const fire = (particleRatio: number, opts: confetti.Options) =>
        confetti({ origin: { y: 0.7 }, ...opts, particleCount: Math.floor(200 * particleRatio) })

      fire(0.25, { spread: 26, startVelocity: 55, colors: ["#f97316", "#fb923c", "#fdba74"] })
      fire(0.2,  { spread: 60, colors: ["#10b981", "#6ee7b7", "#a7f3d0"] })
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#f59e0b", "#fcd34d"] })
      fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
      fire(0.1,  { spread: 120, startVelocity: 45 })
    }
  }, [isDone])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border p-5 shadow-sm transition-colors",
        isDone
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className={cn("h-4 w-4", isDone ? "text-primary" : "text-muted-foreground")} />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            今日目标
          </span>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5">
            <Flame className="h-3 w-3 text-amber-500" />
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {streak}天
            </span>
          </div>
        )}
      </div>

      {/* Numbers */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <motion.span
          key={completed}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          className={cn(
            "text-3xl font-bold tabular-nums",
            isDone ? "text-primary" : "text-foreground"
          )}
        >
          {completed}
        </motion.span>
        <span className="text-sm text-muted-foreground">/ {goal} 张</span>
        {isDone && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm font-semibold text-primary ml-1"
          >
            🎉 今日完成！
          </motion.span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            isDone ? "bg-primary" : "bg-primary/70"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      </div>

      {!isDone && goal > 0 && (
        <p className="text-[11px] text-muted-foreground mt-2">
          还差 <span className="font-semibold text-foreground">{goal - completed}</span> 张达成目标
        </p>
      )}
    </motion.div>
  )
}
