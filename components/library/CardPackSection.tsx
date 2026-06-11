"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, CheckCircle2, Loader2 } from "lucide-react"
import { CARD_PACKS, type CardPack } from "@/data/card-packs"
import { cn } from "@/lib/utils"

type PackState = "idle" | "loading" | "done"

export function CardPackSection() {
  const router = useRouter()
  const [packStates, setPackStates] = useState<Record<string, PackState>>({})

  const handleInstall = async (pack: CardPack) => {
    if (packStates[pack.id] === "loading" || packStates[pack.id] === "done") return

    setPackStates((s) => ({ ...s, [pack.id]: "loading" }))

    try {
      const res = await fetch("/api/cards/batch", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ cards: pack.cards }),
      })

      if (!res.ok) throw new Error("Failed")

      setPackStates((s) => ({ ...s, [pack.id]: "done" }))
      router.refresh()
    } catch {
      setPackStates((s) => ({ ...s, [pack.id]: "idle" }))
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-foreground">精选题库</h2>
        <span className="text-xs text-muted-foreground">· 一键添加到你的知识库</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CARD_PACKS.map((pack, i) => {
          const state = packStates[pack.id] ?? "idle"

          return (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 transition-all",
                state === "done"
                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
                  : "border-border bg-card hover:shadow-sm"
              )}
            >
              {/* Emoji */}
              <span className="text-2xl leading-none mt-0.5 shrink-0">{pack.emoji}</span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-semibold text-foreground">{pack.name}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {pack.cards.length} 张
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                  {pack.description}
                </p>
              </div>

              {/* Button */}
              <button
                onClick={() => handleInstall(pack)}
                disabled={state !== "idle"}
                className={cn(
                  "shrink-0 flex h-7 w-7 items-center justify-center rounded-full transition-all",
                  state === "idle" && "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
                  state === "loading" && "bg-muted text-muted-foreground cursor-wait",
                  state === "done" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 cursor-default"
                )}
                aria-label={state === "done" ? "已添加" : `添加 ${pack.name}`}
              >
                {state === "loading" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : state === "done" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
