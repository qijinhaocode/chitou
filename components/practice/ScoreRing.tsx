"use client"

import { motion } from "framer-motion"

interface ScoreRingProps {
  score: number      // 0-100
  size?: number
  strokeWidth?: number
  className?: string
}

const SCORE_COLOR = (score: number) => {
  if (score >= 80) return { stroke: "#10b981", text: "text-emerald-500" }   // excellent
  if (score >= 60) return { stroke: "#f59e0b", text: "text-amber-500" }     // good
  return { stroke: "#f43f5e", text: "text-rose-500" }                        // needs work
}

const SCORE_LABEL = (score: number) => {
  if (score >= 85) return "优秀"
  if (score >= 70) return "良好"
  if (score >= 50) return "一般"
  return "需加强"
}

export function ScoreRing({ score, size = 120, strokeWidth = 9, className }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const { stroke, text } = SCORE_COLOR(score)

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className={`text-2xl font-bold tabular-nums ${text}`}
        >
          {score}
        </motion.span>
        <span className="text-[11px] text-muted-foreground mt-0.5">{SCORE_LABEL(score)}</span>
      </div>
    </div>
  )
}
