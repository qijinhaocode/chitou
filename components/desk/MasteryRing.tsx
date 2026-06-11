"use client"

import { motion } from "framer-motion"

interface MasteryRingProps {
  masteredCount: number
  digestingCount: number
  pendingCount: number
  total: number
}

export function MasteryRing({ masteredCount, digestingCount, pendingCount, total }: MasteryRingProps) {
  const mastered   = total > 0 ? masteredCount / total : 0
  const digesting  = total > 0 ? digestingCount / total : 0

  const SIZE   = 140
  const STROKE = 12
  const R      = (SIZE - STROKE) / 2
  const CIRC   = 2 * Math.PI * R
  const GAP    = 4 // gap between arcs in pixels

  // Convert fraction to arc length, leaving a small gap between segments
  const masteredLen   = Math.max(0, mastered  * CIRC - GAP)
  const digestingLen  = Math.max(0, digesting * CIRC - GAP)
  const pendingLen    = Math.max(0, (1 - mastered - digesting) * CIRC - GAP)

  // Start offsets (rotate -90° so arcs start at top)
  const masteredOffset  = 0
  const digestingOffset = -(mastered * CIRC)
  const pendingOffset   = -((mastered + digesting) * CIRC)

  const masteryPct = Math.round(mastered * 100)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg
          width={SIZE}
          height={SIZE}
          style={{ transform: "rotate(-90deg)" }}
          className="drop-shadow-sm"
        >
          {/* Background track */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none" stroke="currentColor" strokeWidth={STROKE}
            className="text-muted/30"
          />

          {/* Pending (stone) */}
          <motion.circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none" stroke="#a8a29e" strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={`${pendingLen} ${CIRC}`}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: pendingOffset }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.1 }}
          />

          {/* Digesting (amber) */}
          <motion.circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none" stroke="#f59e0b" strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={`${digestingLen} ${CIRC}`}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: digestingOffset }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
          />

          {/* Mastered (emerald) */}
          <motion.circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none" stroke="#10b981" strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={`${masteredLen} ${CIRC}`}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: masteredOffset }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.3 }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-bold text-foreground tabular-nums"
          >
            {masteryPct}%
          </motion.span>
          <span className="text-[11px] text-muted-foreground">总掌握度</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 w-full">
        {[
          { label: "已吃透", count: masteredCount,  color: "bg-emerald-400" },
          { label: "消化中", count: digestingCount, color: "bg-amber-400"   },
          { label: "待吃透", count: pendingCount,   color: "bg-stone-400"   },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
            <span className="font-medium text-foreground tabular-nums">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
