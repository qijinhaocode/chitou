"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface HeatmapProps {
  /** ISO-date (YYYY-MM-DD) → review count */
  data:  Record<string, number>
  days?: number  // default 91 (13 weeks)
}

const CELL_COLOR = (count: number) => {
  if (count === 0)  return "bg-muted/30 dark:bg-muted/20"
  if (count <= 2)   return "bg-primary/20"
  if (count <= 5)   return "bg-primary/45"
  if (count <= 9)   return "bg-primary/70"
  return "bg-primary"
}

const DAY_LABELS = ["", "一", "", "三", "", "五", ""]

export function Heatmap({ data, days = 91 }: HeatmapProps) {
  // Build a grid of `days` cells ending today, oldest first
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const cells: Array<{ date: string; count: number; isToday: boolean }> = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    cells.push({ date: key, count: data[key] ?? 0, isToday: i === 0 })
  }

  // Pad front so first cell aligns to Monday (weekday 1)
  const firstDay = new Date(cells[0].date).getDay() // 0=Sun
  const padStart = (firstDay === 0 ? 6 : firstDay - 1) // Mon=0
  const paddedCells = [
    ...Array(padStart).fill(null),
    ...cells,
  ]

  // Group into weeks (columns of 7)
  const weeks: Array<Array<{ date: string; count: number; isToday: boolean } | null>> = []
  for (let i = 0; i < paddedCells.length; i += 7) {
    weeks.push(paddedCells.slice(i, i + 7))
  }

  // Month labels: first week containing the 1st of each month
  const monthLabels: Array<{ weekIdx: number; label: string }> = []
  let lastMonth = -1
  weeks.forEach((week, wi) => {
    week.forEach((cell) => {
      if (!cell) return
      const d = new Date(cell.date)
      if (d.getDate() <= 7 && d.getMonth() !== lastMonth) {
        lastMonth = d.getMonth()
        monthLabels.push({
          weekIdx: wi,
          label: `${d.getMonth() + 1}月`,
        })
      }
    })
  })

  const totalReviews = Object.values(data).reduce((s, v) => s + v, 0)
  const activeDays   = Object.values(data).filter(v => v > 0).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.45 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          90 天打卡记录
        </p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>共 <span className="font-semibold text-foreground">{totalReviews}</span> 次复习</span>
          <span><span className="font-semibold text-foreground">{activeDays}</span> 天有记录</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-0 min-w-max">
          {/* Day-of-week labels column */}
          <div className="flex flex-col gap-[3px] mr-1.5 pt-5">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="h-[10px] flex items-center">
                <span className="text-[9px] text-muted-foreground/50 w-3 text-right">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div>
            {/* Month labels row */}
            <div className="flex gap-[3px] mb-1 h-4">
              {weeks.map((_, wi) => {
                const label = monthLabels.find(m => m.weekIdx === wi)
                return (
                  <div key={wi} className="w-[10px] flex-shrink-0">
                    {label && (
                      <span className="text-[9px] text-muted-foreground/70 whitespace-nowrap">
                        {label.label}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Cells */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((cell, di) => {
                    if (!cell) return <div key={di} className="h-[10px] w-[10px]" />
                    return (
                      <motion.div
                        key={cell.date}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, delay: wi * 0.01 }}
                        title={`${cell.date}：${cell.count} 次复习`}
                        className={cn(
                          "h-[10px] w-[10px] rounded-[2px] cursor-default transition-transform hover:scale-125",
                          CELL_COLOR(cell.count),
                          cell.isToday && "ring-1 ring-primary ring-offset-1 ring-offset-card"
                        )}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-muted-foreground/60">少</span>
        {[0, 2, 5, 9, 10].map((n) => (
          <div key={n} className={cn("h-[10px] w-[10px] rounded-[2px]", CELL_COLOR(n))} />
        ))}
        <span className="text-[10px] text-muted-foreground/60">多</span>
      </div>
    </motion.div>
  )
}
