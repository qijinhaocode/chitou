"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, BrainCircuit, Flag, RotateCcw, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut"
import type { InterviewMessage } from "@/app/api/ai/interview/route"

const TOTAL_TURNS = 4

interface Topic { id: string; label: string; emoji: string }
const TOPICS: Topic[] = [
  { id: "算法与数据结构", label: "算法与数据结构", emoji: "⚡" },
  { id: "系统设计",       label: "系统设计",       emoji: "🏗️" },
  { id: "前端开发",       label: "前端开发",       emoji: "⚛️" },
  { id: "数据库与存储",   label: "数据库与存储",   emoji: "🗄️" },
  { id: "计算机网络",     label: "计算机网络",     emoji: "🌐" },
  { id: "操作系统",       label: "操作系统",       emoji: "💻" },
]

type Phase = "selecting" | "chatting" | "done"

export function InterviewSession() {
  const [phase,     setPhase]     = useState<Phase>("selecting")
  const [topic,     setTopic]     = useState("")
  const [messages,  setMessages]  = useState<InterviewMessage[]>([])
  const [input,     setInput]     = useState("")
  const [turn,      setTurn]      = useState(1)
  const [streaming, setStreaming] = useState(false)
  const [liveText,  setLiveText]  = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isReport = turn > TOTAL_TURNS

  // Cmd+Enter → send
  useKeyboardShortcut((e) => {
    if ((e.metaKey || e.ctrlKey) && e.code === "Enter" && !streaming && input.trim() && phase === "chatting" && !isReport) {
      e.preventDefault()
      handleSend()
    }
  }, [input, streaming, phase, isReport])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, liveText])

  const startInterview = async (selectedTopic: string) => {
    setTopic(selectedTopic)
    setPhase("chatting")
    setTurn(1)
    setMessages([])
    await callInterviewer([], selectedTopic, 1)
  }

  const callInterviewer = async (
    history: InterviewMessage[],
    t: string,
    currentTurn: number
  ) => {
    setStreaming(true)
    setLiveText("")

    const res = await fetch("/api/ai/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: history,
        topic:    t,
        turn:     currentTurn,
        total:    TOTAL_TURNS,
      }),
    })

    const reader  = res.body!.getReader()
    const decoder = new TextDecoder()
    let   full    = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      full += chunk
      setLiveText(full)
    }

    const aiMsg: InterviewMessage = { role: "assistant", content: full }
    setMessages(prev => [...prev, aiMsg])
    setLiveText("")
    setStreaming(false)

    if (currentTurn > TOTAL_TURNS) {
      setPhase("done")
    } else {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || streaming) return
    const userMsg: InterviewMessage = { role: "user", content: input.trim() }
    const nextTurn = turn + 1
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setInput("")
    setTurn(nextTurn)
    await callInterviewer(newHistory, topic, nextTurn)
  }

  const handleEndInterview = async () => {
    if (streaming) return
    setTurn(TOTAL_TURNS + 1)
    await callInterviewer(messages, topic, TOTAL_TURNS + 1)
  }

  const reset = () => {
    setPhase("selecting")
    setMessages([])
    setInput("")
    setTurn(1)
    setLiveText("")
    setTopic("")
  }

  // ── Topic selector ──────────────────────────────────────────────────────
  if (phase === "selecting") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-full gap-6 px-8 py-10"
      >
        <div className="text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <BrainCircuit className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-foreground">模拟面试模式</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            AI 扮演字节跳动面试官，{TOTAL_TURNS} 轮深度追问，最后给出综合评价
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
          {TOPICS.map((t) => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => startInterview(t.id)}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-xs font-medium text-foreground text-center">{t.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    )
  }

  const progress = Math.min(((turn - 1) / TOTAL_TURNS) * 100, 100)

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{topic}</span>
          <span className="text-xs text-muted-foreground">
            {phase === "done" ? "面试结束" : `第 ${Math.min(turn - 1, TOTAL_TURNS)} / ${TOTAL_TURNS} 轮`}
          </span>
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-24 h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {!streaming && phase === "chatting" && !isReport && (
            <button
              onClick={handleEndInterview}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Flag className="h-3 w-3" />
              结束面试
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mr-2 mt-0.5">
                  <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted/40 rounded-bl-sm"
                )}
              >
                {msg.role === "assistant"
                  ? <MarkdownRenderer content={msg.content} compact />
                  : <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                }
              </div>
            </motion.div>
          ))}

          {/* Streaming bubble */}
          {streaming && liveText && (
            <motion.div
              key="streaming"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mr-2 mt-0.5">
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted/40 px-4 py-3">
                <MarkdownRenderer content={liveText} compact />
              </div>
            </motion.div>
          )}

          {/* Thinking indicator */}
          {streaming && !liveText && (
            <motion.div key="thinking" className="flex justify-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mr-2 mt-0.5">
                <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-muted/40 px-4 py-3">
                <div className="flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* ── Input or Done actions ──────────────────────────────────────── */}
      {phase === "chatting" && !isReport && (
        <div className="shrink-0 border-t border-border/60 px-6 py-4">
          <div className="flex gap-3 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="输入你的回答…"
              disabled={streaming}
              className="flex-1 resize-none min-h-[72px] max-h-40 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                "bg-primary text-primary-foreground",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "hover:bg-primary/80 active:scale-95"
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 text-right">
            <kbd className="font-mono">⌘↵</kbd> 发送
          </p>
        </div>
      )}

      {phase === "done" && (
        <div className="shrink-0 border-t border-border/60 px-6 py-4 flex justify-center gap-3">
          <button onClick={reset} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
            <RotateCcw className="h-3.5 w-3.5" />
            再面一次
          </button>
          <Link href="/desk" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
            <LayoutDashboard className="h-3.5 w-3.5" />
            回到书桌
          </Link>
        </div>
      )}
    </div>
  )
}
