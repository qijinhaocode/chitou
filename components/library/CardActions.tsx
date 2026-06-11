"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Check, X, Loader2 } from "lucide-react"
import { cn, CATEGORY_LABELS } from "@/lib/utils"
import type { CardCategory } from "@/types"

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [CardCategory, string][]

interface CardActionsProps {
  cardId:          string
  initialTitle:    string
  initialQuestion: string
  initialAnswer:   string
  initialCategory: CardCategory
  initialDifficulty: number
}

export function CardActions({
  cardId, initialTitle, initialQuestion, initialAnswer, initialCategory, initialDifficulty,
}: CardActionsProps) {
  const router = useRouter()
  const [mode,     setMode]     = useState<"view" | "edit" | "delete">("view")
  const [saving,   setSaving]   = useState(false)
  const [title,    setTitle]    = useState(initialTitle)
  const [question, setQuestion] = useState(initialQuestion)
  const [answer,   setAnswer]   = useState(initialAnswer)
  const [category, setCategory] = useState<CardCategory>(initialCategory)
  const [difficulty, setDifficulty] = useState(initialDifficulty)

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/cards/${cardId}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ title, question, referenceAnswer: answer, category, difficulty }),
    })
    setSaving(false)
    setMode("view")
    router.refresh()
  }

  const handleDelete = async () => {
    setSaving(true)
    await fetch(`/api/cards/${cardId}`, { method: "DELETE" })
    router.refresh()
  }

  if (mode === "edit") {
    return (
      <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="标题"
          className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="题目"
          rows={2}
          className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
        />
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="参考答案"
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
        />
        <div className="flex gap-2">
          <select
            value={category}
            onChange={e => setCategory(e.target.value as CardCategory)}
            className="flex-1 rounded-lg border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select
            value={difficulty}
            onChange={e => setDifficulty(Number(e.target.value))}
            className="w-24 rounded-lg border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            {[1,2,3,4,5].map(d => <option key={d} value={d}>难度 {d}</option>)}
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setMode("view")}
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3 w-3" /> 取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            保存
          </button>
        </div>
      </div>
    )
  }

  if (mode === "delete") {
    return (
      <div className="mt-3 flex items-center gap-3 border-t border-border/60 pt-3">
        <p className="flex-1 text-xs text-muted-foreground">确定删除这张卡片？</p>
        <button
          onClick={() => setMode("view")}
          className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleDelete}
          disabled={saving}
          className="flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/20 transition-colors"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          删除
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => setMode("edit")}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg",
          "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        )}
        title="编辑"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setMode("delete")}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg",
          "text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        )}
        title="删除"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
