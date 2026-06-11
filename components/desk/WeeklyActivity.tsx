"use client"

import { motion } from "framer-motion"
import type { DayData } from "@/lib/desk"

export type { DayData }

interface WeeklyActivityProps {
  data: DayData[]
}

export function WeeklyActivity({ data }: WeeklyActivityProps) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        本周学习活动
      </p>

      <div className="flex items-end gap-2 h-20">
        {data.map((day, i) => {
          const heightPct = day.count > 0 ? Math.max((day.count / max) * 100, 12) : 0

          return (
            <div key={day.label} className="flex-1 flex flex-col items-center gap-1.5">
              {/* Bar */}
              <div className="relative w-full flex items-end justify-center" style={{ height: 56 }}>
                {day.count > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${heightPct}%`, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.06, ease: "easeOut" }}
                    className={`
                      w-full rounded-t-md
                      ${day.isToday
                        ? "bg-primary shadow-sm"
                        : "bg-primary/25 hover:bg-primary/40 transition-colors"
                      }
                    `}
                    style={{ position: "absolute", bottom: 0 }}
                  />
                )}
                {day.count === 0 && (
                  <div className="w-full h-1 rounded bg-muted/40 absolute bottom-0" />
                )}
              </div>

              {/* Count label */}
              <span className={`text-[11px] tabular-nums font-medium ${
                day.isToday ? "text-primary" : "text-muted-foreground"
              }`}>
                {day.count > 0 ? day.count : "—"}
              </span>

              {/* Day label */}
              <span className={`text-[10px] ${
                day.isToday ? "text-primary font-semibold" : "text-muted-foreground/60"
              }`}>
                {day.isToday ? "今天" : day.label}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

