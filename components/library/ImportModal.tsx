"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles, ChevronRight
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/utils"
import type { CardCategory } from "@/types"

interface ExtractedCard {
  id:         string
  title:      string
  category:   string
  difficulty: number
}

type Phase = "idle" | "dragging" | "uploading" | "extracting" | "done" | "error"

interface ImportModalProps {
  open:    boolean
  onClose: () => void
}

const ACCEPTED = ".pdf,.txt,.md,.markdown"
const MAX_MB   = 10

export function ImportModal({ open, onClose }: ImportModalProps) {
  const router   = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase,    setPhase]    = useState<Phase>("idle")
  const [file,     setFile]     = useState<File | null>(null)
  const [cards,    setCards]    = useState<ExtractedCard[]>([])
  const [errorMsg, setErrorMsg] = useState("")

  const reset = () => {
    setPhase("idle"); setFile(null); setCards([]); setErrorMsg("")
  }

  const handleClose = () => { reset(); onClose() }

  // ── File validation & upload ──────────────────────────────────────────────
  const processFile = useCallback(async (f: File) => {
    const ext = f.name.toLowerCase().split(".").pop() ?? ""
    if (!["pdf", "txt", "md", "markdown"].includes(ext)) {
      setErrorMsg("仅支持 PDF、TXT、Markdown 格式"); setPhase("error"); return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setErrorMsg(`文件不能超过 ${MAX_MB} MB`); setPhase("error"); return
    }

    setFile(f); setPhase("uploading")

    const form = new FormData()
    form.append("file", f)

    try {
      setPhase("extracting")
      const res = await fetch("/api/import", { method: "POST", body: form })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "提取失败，请重试")
      }

      const { cards: saved } = await res.json()
      setCards(saved)
      setPhase("done")
    } catch (err) {
      setErrorMsg((err as Error).message)
      setPhase("error")
    }
  }, [])

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setPhase("dragging") }
  const onDragLeave = ()                    => { if (phase === "dragging") setPhase("idle") }
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  const handleSaveAndClose = () => {
    router.refresh()   // re-fetch Server Component (library list)
    handleClose()
  }

  const isWorking = phase === "uploading" || phase === "extracting"

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI 智能萃取
          </DialogTitle>
          <DialogDescription>
            上传简历、面经或技术文档，AI 自动提取面试备考知识卡片
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          {/* ── Drop zone (idle / dragging / error) ────────────────────── */}
          {(phase === "idle" || phase === "dragging" || phase === "error") && (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed",
                "cursor-pointer py-10 transition-colors",
                phase === "dragging"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/20",
                phase === "error" && "border-rose-300 bg-rose-50/40 dark:bg-rose-950/20"
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={onFileChange}
              />
              {phase === "error" ? (
                <>
                  <AlertCircle className="h-9 w-9 text-rose-500" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-rose-600">{errorMsg}</p>
                    <p className="text-xs text-muted-foreground mt-1">点击重新选择文件</p>
                  </div>
                </>
              ) : (
                <>
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                    phase === "dragging" ? "bg-primary/15" : "bg-muted/50"
                  )}>
                    <Upload className={cn(
                      "h-6 w-6 transition-colors",
                      phase === "dragging" ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      {phase === "dragging" ? "松开即可上传" : "拖拽文件到此处，或点击选择"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      支持 PDF、TXT、Markdown · 最大 {MAX_MB} MB
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Extracting ─────────────────────────────────────────────── */}
          {isWorking && (
            <div className="flex flex-col items-center gap-4 py-10">
              {/* Spinner */}
              <div className="relative h-14 w-14">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-primary/20"
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  AI 正在提取知识点…
                </p>
                {file && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <FileText className="h-3 w-3" />
                    {file.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  通常需要 10–30 秒，请稍候
                </p>
              </div>
            </div>
          )}

          {/* ── Done: card preview ─────────────────────────────────────── */}
          {phase === "done" && cards.length > 0 && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <p className="text-sm font-medium text-foreground">
                    成功提取 <span className="text-emerald-600">{cards.length}</span> 张知识卡片
                  </p>
                </div>

                <div className="max-h-52 overflow-y-auto rounded-xl border border-border divide-y divide-border/60">
                  {cards.map((card, i) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      <span className="text-xs text-muted-foreground/50 tabular-nums w-4 shrink-0">
                        {i + 1}
                      </span>
                      <p className="flex-1 text-xs text-foreground truncate min-w-0">
                        {card.title}
                      </p>
                      <span className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                        CATEGORY_COLORS[card.category as CardCategory] ?? "bg-stone-100 text-stone-500"
                      )}>
                        {CATEGORY_LABELS[card.category as CardCategory] ?? card.category}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1" onClick={reset}>
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    再导入一个
                  </Button>
                  <Button className="flex-1 gap-1.5" onClick={handleSaveAndClose}>
                    前往知识储备库
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
