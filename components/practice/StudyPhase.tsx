"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BookOpen, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer"
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut"
import type { Card } from "@/types"

interface StudyPhaseProps {
  card: Card
  progress: { current: number; total: number }
  onReady: () => void
}

export function StudyPhase({ card, progress, onReady }: StudyPhaseProps) {
  const [seconds, setSeconds] = useState(0)

  // Space / Enter → advance to recall
  useKeyboardShortcut((e) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault()
      onReady()
    }
  }, [onReady])

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

  return (
    <motion.div
      key="study"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>建立印象</span>
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
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
        {/* Question */}
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-primary mb-2">
            题目
          </p>
          <h2 className="text-xl font-semibold text-foreground leading-relaxed">
            {card.question}
          </h2>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dashed border-border/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">参考答案</span>
          </div>
        </div>

        {/* Reference answer */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
          <MarkdownRenderer content={card.referenceAnswer} />
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          仔细阅读参考答案，用自己的话理解核心要点。
        </p>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border/60 px-6 py-4 flex justify-end">
        <Button onClick={onReady} size="lg" className="gap-2">
          我已理解，开始闭卷
          <ChevronRight className="h-4 w-4" />
          <kbd className="ml-1 hidden sm:inline-flex h-5 items-center rounded border border-primary-foreground/30 bg-primary-foreground/10 px-1.5 text-[10px] font-mono">Space</kbd>
        </Button>
      </div>
    </motion.div>
  )
}
