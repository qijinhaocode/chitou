"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { PenLine, Clock, ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Card } from "@/types"

interface RecallPhaseProps {
  card: Card
  progress: { current: number; total: number }
  userAnswer: string
  isEvaluating: boolean
  onAnswerChange: (v: string) => void
  onSubmit: () => void
  onBack: () => void
}

const MIN_CHARS = 30

export function RecallPhase({
  card,
  progress,
  userAnswer,
  isEvaluating,
  onAnswerChange,
  onSubmit,
  onBack,
}: RecallPhaseProps) {
  const [seconds, setSeconds] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
  const canSubmit = userAnswer.trim().length >= MIN_CHARS && !isEvaluating

  return (
    <motion.div
      key="recall"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={onBack}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            disabled={isEvaluating}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回阅读
          </button>
          <span className="text-border">·</span>
          <PenLine className="h-4 w-4" />
          <span>闭卷输出</span>
          <span className="text-border">·</span>
          <span className="font-medium text-foreground">
            {progress.current} / {progress.total}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
          <Clock className="h-3.5 w-3.5" />
          {formatTime(seconds)}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-6 py-6 max-w-3xl mx-auto w-full min-h-0">
        {/* Question (only the question, no answer) */}
        <div className="mb-5 shrink-0">
          <p className="text-xs font-medium uppercase tracking-widest text-primary mb-2">
            题目
          </p>
          <h2 className="text-lg font-semibold text-foreground leading-relaxed">
            {card.question}
          </h2>
        </div>

        {/* Answer area */}
        <div className="flex-1 flex flex-col min-h-0">
          <Textarea
            ref={textareaRef}
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="用你自己的话回答……不需要完美，写出你真实的理解即可。"
            disabled={isEvaluating}
            className={cn(
              "flex-1 resize-none text-sm leading-relaxed p-4 min-h-[220px]",
              "bg-card border-border/80 focus-visible:border-primary/60",
              "placeholder:text-muted-foreground/50"
            )}
          />
          <div className="flex items-center justify-between mt-2">
            <span
              className={cn(
                "text-xs tabular-nums",
                userAnswer.length < MIN_CHARS ? "text-muted-foreground" : "text-emerald-500"
              )}
            >
              {userAnswer.length} 字符
              {userAnswer.length < MIN_CHARS && (
                <span className="ml-1 text-muted-foreground/60">
                  （至少 {MIN_CHARS} 字符）
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border/60 px-6 py-4 flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          size="lg"
          className="gap-2 min-w-[140px]"
        >
          {isEvaluating ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
              />
              AI 判卷中…
            </>
          ) : (
            <>
              提交答案
              <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
