"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Zap, ChevronRight, Clock } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn, CATEGORY_LABELS, CATEGORY_COLORS, formatDueDate } from "@/lib/utils"
import type { Card } from "@/types"

interface TodayQueueProps {
  cards: Card[]
}

const MASTERY_BADGE: Record<string, string> = {
  pending:   "bg-stone-100 text-stone-500 dark:bg-stone-800/50 dark:text-stone-400",
  digesting: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
  mastered:  "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-500",
}
const MASTERY_LABEL: Record<string, string> = {
  pending:   "待吃透",
  digesting: "消化中",
  mastered:  "复习",
}

export function TodayQueue({ cards }: TodayQueueProps) {
  const due    = cards.slice(0, 6) // show max 6 items
  const more   = Math.max(0, cards.length - 6)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3, ease: "easeOut" }}
      className="rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <Clock className="h-3.5 w-3.5 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">今日待复习</p>
          {cards.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground px-1.5">
              {cards.length}
            </span>
          )}
        </div>
        {cards.length > 0 && (
          <Link
            href="/practice/session"
            className={cn(buttonVariants({ size: "sm" }), "gap-1.5 text-xs h-7")}
          >
            <Zap className="h-3 w-3" strokeWidth={2.5} />
            开始练习
          </Link>
        )}
      </div>

      {/* Card list */}
      <div className="flex-1 divide-y divide-border/50">
        {due.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
            <div className="text-2xl">🎉</div>
            <p className="text-sm font-medium text-foreground">今日任务已完成</p>
            <p className="text-xs text-muted-foreground">明天再来继续吃透新知识</p>
          </div>
        ) : (
          due.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.35 + i * 0.06 }}
              className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group"
            >
              {/* Index */}
              <span className="text-xs text-muted-foreground/60 tabular-nums w-4 shrink-0">
                {i + 1}
              </span>

              {/* Title + category */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{card.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn(
                    "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                    CATEGORY_COLORS[card.category]
                  )}>
                    {CATEGORY_LABELS[card.category]}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {formatDueDate(card.due)}
                  </span>
                </div>
              </div>

              {/* Mastery badge */}
              <span className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                MASTERY_BADGE[card.masteryStatus]
              )}>
                {MASTERY_LABEL[card.masteryStatus]}
              </span>

              {/* Arrow */}
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
            </motion.div>
          ))
        )}

        {more > 0 && (
          <div className="px-5 py-2.5 text-xs text-muted-foreground text-center">
            还有 {more} 张卡片…
          </div>
        )}
      </div>
    </motion.div>
  )
}
