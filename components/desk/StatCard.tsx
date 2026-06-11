"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  accent: "rose" | "amber" | "emerald" | "orange" | "stone"
  delay?: number
}

const ACCENT: Record<StatCardProps["accent"], { value: string; dot: string; bg: string }> = {
  rose:    { value: "text-rose-500",    dot: "bg-rose-400",    bg: "bg-rose-50 dark:bg-rose-950/20" },
  amber:   { value: "text-amber-500",   dot: "bg-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/20" },
  emerald: { value: "text-emerald-500", dot: "bg-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  orange:  { value: "text-primary",     dot: "bg-primary",     bg: "bg-primary/5" },
  stone:   { value: "text-foreground",  dot: "bg-stone-400",   bg: "bg-muted/40" },
}

export function StatCard({ label, value, sub, accent, delay = 0 }: StatCardProps) {
  const a = ACCENT[accent]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={cn(
        "relative rounded-2xl border border-border bg-card p-5 shadow-sm overflow-hidden",
        "hover:shadow-md transition-shadow"
      )}
    >
      {/* Subtle accent tint in top-right corner */}
      <div className={cn("absolute -top-4 -right-4 h-16 w-16 rounded-full opacity-60", a.bg)} />

      <div className="relative">
        <div className="flex items-center gap-1.5 mb-3">
          <span className={cn("h-2 w-2 rounded-full", a.dot)} />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
        </div>
        <p className={cn("text-3xl font-bold tabular-nums leading-none", a.value)}>
          {value}
        </p>
        {sub && (
          <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>
        )}
      </div>
    </motion.div>
  )
}
