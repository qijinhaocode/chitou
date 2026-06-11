"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BrainCircuit, Loader2, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react"
import { cn, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/utils"
import type { CardCategory } from "@/types"

interface WeakPoint {
  concept:  string
  category: string
  avgScore: number
  reason:   string
  action:   string
}

interface WeaknessReport {
  weakPoints:   WeakPoint[]
  weekSummary:  string
  topPriority:  string
  overallTrend: "improving" | "stable" | "declining"
  empty?:       boolean
}

const TREND_ICON = {
  improving: <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />,
  stable:    <Minus className="h-3.5 w-3.5 text-amber-500" />,
  declining: <TrendingDown className="h-3.5 w-3.5 text-rose-500" />,
}
const TREND_LABEL = {
  improving: "进步中",
  stable:    "保持稳定",
  declining: "需要加油",
}

const SCORE_COLOR = (s: number) =>
  s >= 75 ? "bg-emerald-500" : s >= 55 ? "bg-amber-500" : "bg-rose-500"

export function WeaknessCard() {
  const [report,  setReport]  = useState<WeaknessReport | null>(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/user/weakness")
      const data = await res.json()
      setReport(data)
    } catch {
      setReport({
        weakPoints:  [],
        weekSummary: "分析失败，请稍后重试。",
        topPriority: "",
        overallTrend:"stable",
      })
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            本周弱点分析
          </p>
          {report && !report.empty && (
            <div className="flex items-center gap-1">
              {TREND_ICON[report.overallTrend]}
              <span className="text-[11px] text-muted-foreground">
                {TREND_LABEL[report.overallTrend]}
              </span>
            </div>
          )}
        </div>

        {!report && (
          <button
            onClick={analyze}
            disabled={loading}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
              loading && "opacity-60 cursor-not-allowed"
            )}
          >
            {loading
              ? <><Loader2 className="h-3 w-3 animate-spin" />分析中…</>
              : <><BrainCircuit className="h-3 w-3" />开始分析</>
            }
          </button>
        )}

        {report && (
          <button
            onClick={() => { setReport(null); analyze() }}
            disabled={loading}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            重新分析
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Idle state */}
        {!report && !loading && (
          <motion.p
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-muted-foreground"
          >
            AI 分析你近7天的复习记录，找出最需要强化的知识点。
          </motion.p>
        )}

        {/* Loading */}
        {loading && !report && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground py-2"
          >
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Claude 正在分析你的复习数据…
          </motion.div>
        )}

        {/* Empty */}
        {report?.empty && (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground"
          >
            还没有足够的复习记录。先完成几道题，再来分析弱点吧！
          </motion.p>
        )}

        {/* Report */}
        {report && !report.empty && report.weakPoints.length > 0 && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {report.weekSummary}
            </p>

            {/* Weak points */}
            <div className="space-y-3">
              {report.weakPoints.map((wp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-medium",
                        CATEGORY_COLORS[wp.category as CardCategory] ?? "bg-stone-100 text-stone-500"
                      )}>
                        {CATEGORY_LABELS[wp.category as CardCategory] ?? wp.category}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{wp.concept}</span>
                    </div>
                    <span className={cn(
                      "shrink-0 text-xs font-bold tabular-nums",
                      wp.avgScore >= 75 ? "text-emerald-500" : wp.avgScore >= 55 ? "text-amber-500" : "text-rose-500"
                    )}>
                      {wp.avgScore}分
                    </span>
                  </div>

                  {/* Score bar */}
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", SCORE_COLOR(wp.avgScore))}
                      initial={{ width: 0 }}
                      animate={{ width: `${wp.avgScore}%` }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 + i * 0.1 }}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">{wp.reason}</p>

                  <div className="flex items-start gap-1.5">
                    <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-foreground font-medium">{wp.action}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Top priority */}
            {report.topPriority && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                <p className="text-xs font-semibold text-primary mb-0.5">本周首要任务</p>
                <p className="text-sm text-foreground">{report.topPriority}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
