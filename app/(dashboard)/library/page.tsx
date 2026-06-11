import { prisma } from "@/lib/db/prisma"
import { getDemoUserId } from "@/lib/db/demo"
import { deriveMasteryStatus } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_LABELS, CATEGORY_COLORS, cn } from "@/lib/utils"
import type { CardCategory } from "@/types"

export const revalidate = 0

const MASTERY_STYLE: Record<string, string> = {
  pending:   "bg-stone-100 text-stone-500",
  digesting: "bg-amber-100 text-amber-600",
  mastered:  "bg-emerald-100 text-emerald-600",
}
const MASTERY_LABEL: Record<string, string> = {
  pending:   "待吃透",
  digesting: "消化中",
  mastered:  "已吃透",
}
const DIFFICULTY_DOTS = ["", "●", "●●", "●●●", "●●●●", "●●●●●"]

export default async function LibraryPage() {
  const userId = await getDemoUserId()

  const cards = await prisma.card.findMany({
    where:   { userId },
    orderBy: [{ masteryStatus: "asc" }, { due: "asc" }],
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          共 <span className="font-semibold text-foreground">{cards.length}</span> 张卡片
        </p>
      </div>

      <div className="space-y-2">
        {cards.map((card) => {
          const mastery = deriveMasteryStatus(
            card.fsrsState as any, card.reps, card.lastScore
          )
          return (
            <div
              key={card.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{card.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn(
                    "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                    CATEGORY_COLORS[card.category as CardCategory]
                  )}>
                    {CATEGORY_LABELS[card.category as CardCategory]}
                  </span>
                  <span className="text-[10px] text-amber-400 tracking-tighter">
                    {DIFFICULTY_DOTS[card.difficulty]}
                  </span>
                  {card.reps > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      已复习 {card.reps} 次
                    </span>
                  )}
                </div>
              </div>

              {/* Last score */}
              {card.lastScore !== null && (
                <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                  {card.lastScore} 分
                </span>
              )}

              {/* Mastery badge */}
              <Badge className={cn("shrink-0 text-[11px]", MASTERY_STYLE[mastery])}>
                {MASTERY_LABEL[mastery]}
              </Badge>
            </div>
          )
        })}

        {cards.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            还没有卡片，快去练习吧 🚀
          </div>
        )}
      </div>
    </div>
  )
}
