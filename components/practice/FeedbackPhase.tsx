"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, ChevronDown, ChevronUp, Lightbulb, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer"
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut"
import { ScoreRing } from "./ScoreRing"
import { DimensionScore } from "./DimensionScore"
import { cn } from "@/lib/utils"
import type { EvaluationResult, FSRSRating, Card } from "@/types"

interface FeedbackPhaseProps {
  card: Card
  evaluation: EvaluationResult
  userAnswer: string
  progress: { current: number; total: number }
  onRate: (rating: FSRSRating) => void
}

const RATINGS: { value: FSRSRating; label: string; sub: string; color: string }[] = [
  { value: 1, label: "又忘了", sub: "完全不会", color: "hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40" },
  { value: 2, label: "有点难", sub: "模糊记得", color: "hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40" },
  { value: 3, label: "记住了", sub: "基本掌握", color: "hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40" },
  { value: 4, label: "完全掌握", sub: "轻松回答", color: "hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40" },
]

export function FeedbackPhase({ card, evaluation, userAnswer, progress, onRate }: FeedbackPhaseProps) {
  const [showAnswer, setShowAnswer] = useState(false)
  const [showMyAnswer, setShowMyAnswer] = useState(false)

  // 1/2/3/4 keys → instant FSRS rating
  useKeyboardShortcut((e) => {
    const key = e.key
    if (["1", "2", "3", "4"].includes(key)) {
      e.preventDefault()
      onRate(Number(key) as FSRSRating)
    }
  }, [onRate])
  const isLast = progress.current === progress.total

  return (
    <motion.div
      key="feedback"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border/60 shrink-0 text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        <span>AI 判卷完成</span>
        <span className="text-border">·</span>
        <span className="font-medium text-foreground">{progress.current} / {progress.total}</span>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Score section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <ScoreRing score={evaluation.overallScore} size={100} strokeWidth={8} className="shrink-0" />
            <div className="flex-1 space-y-3 min-w-0">
              <DimensionScore label="概念准确度" score={evaluation.accuracyScore} delay={0.3} />
              <DimensionScore label="细节完备性" score={evaluation.completenessScore} delay={0.45} />
              <DimensionScore label="表达逻辑性" score={evaluation.logicScore} delay={0.6} />
            </div>
          </motion.div>

          {/* AI Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-xl border border-border bg-card p-5 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  AI 评语
                </p>
                <MarkdownRenderer content={evaluation.aiFeedback} compact />
              </div>
            </div>

            <div className="h-px bg-border/60 mx-0" />

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <Lightbulb className="h-4 w-4 text-amber-500" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  改进建议
                </p>
                <MarkdownRenderer content={evaluation.aiSuggestion} compact />
              </div>
            </div>
          </motion.div>

          {/* Collapsible sections */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            {/* My answer */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setShowMyAnswer((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>我的作答</span>
                {showMyAnswer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showMyAnswer && (
                <div className="px-4 pb-4 border-t border-border/60">
                  <div className="mt-3">
                    <MarkdownRenderer content={userAnswer} compact />
                  </div>
                </div>
              )}
            </div>

            {/* Reference answer */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setShowAnswer((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>参考答案</span>
                {showAnswer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {showAnswer && (
                <div className="px-4 pb-4 border-t border-border/60">
                  <div className="mt-3">
                    <MarkdownRenderer content={card.referenceAnswer} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Rating footer ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="shrink-0 border-t border-border/60 px-6 py-4"
      >
        <p className="text-xs text-center text-muted-foreground mb-3">
          如实评价你的掌握程度，AI 将据此安排下次复习时间
        </p>
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.value}
              onClick={() => onRate(r.value)}
              className={cn(
                "flex flex-col items-center rounded-xl border border-border bg-background",
                "py-2.5 px-2 transition-all duration-150 active:scale-95",
                r.color
              )}
            >
              <div className="flex items-center gap-1.5">
                <kbd className="hidden sm:flex h-4 w-4 items-center justify-center rounded border border-current/20 bg-current/10 text-[9px] font-mono opacity-60">
                  {r.value}
                </kbd>
                <span className="text-sm font-semibold">{r.label}</span>
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5">{r.sub}</span>
            </button>
          ))}
        </div>
        {isLast && (
          <p className="text-xs text-center text-primary font-medium mt-3">
            这是最后一张 — 完成后查看本次练习总结
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
