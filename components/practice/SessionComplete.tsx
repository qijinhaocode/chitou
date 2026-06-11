"use client"

import { motion } from "framer-motion"
import { Trophy, RotateCcw, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SessionResult } from "@/types"

interface SessionCompleteProps {
  results: SessionResult[]
  onRestart: () => void
}

export function SessionComplete({ results, onRestart }: SessionCompleteProps) {
  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + r.evaluation.overallScore, 0) / results.length)
    : 0

  const distribution = [4, 3, 2, 1].map((rating) => ({
    rating,
    count: results.filter((r) => r.rating === rating).length,
    label: ["完全掌握", "记住了", "有点难", "又忘了"][4 - rating],
    color: ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-rose-500"][4 - rating],
  }))

  return (
    <motion.div
      key="complete"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-full gap-6 px-6 py-10 text-center"
    >
      {/* Trophy */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
      >
        <Trophy className="h-10 w-10 text-primary" strokeWidth={1.5} />
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-foreground">练习完成！</h2>
        <p className="text-sm text-muted-foreground mt-1">
          本次完成 {results.length} 张卡片，平均得分 <span className="font-semibold text-foreground">{avg}</span> 分
        </p>
      </div>

      {/* Stats */}
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 space-y-3">
        {distribution.map((d) => (
          <div key={d.rating} className="flex items-center gap-3">
            <span className="w-16 text-right text-sm text-muted-foreground shrink-0">{d.label}</span>
            <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", d.color)}
                initial={{ width: 0 }}
                animate={{ width: results.length ? `${(d.count / results.length) * 100}%` : "0%" }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              />
            </div>
            <span className="w-4 text-sm font-medium text-foreground tabular-nums shrink-0">
              {d.count}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          <RotateCcw className="h-4 w-4" />
          再练一轮
        </button>
        <Link href="/desk" className={cn(buttonVariants(), "gap-2")}>
          <LayoutDashboard className="h-4 w-4" />
          回到书桌
        </Link>
      </div>
    </motion.div>
  )
}
