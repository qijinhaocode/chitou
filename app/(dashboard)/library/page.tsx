import { Badge } from "@/components/ui/badge"

const MOCK_CARDS = [
  { id: "1", title: "解释 TCP 三次握手", category: "network", mastery: "digesting" },
  { id: "2", title: "数据库索引底层原理（B+ 树）", category: "database", mastery: "pending" },
  { id: "3", title: "React Fiber 架构", category: "language", mastery: "mastered" },
  { id: "4", title: "设计短链接服务", category: "system-design", mastery: "pending" },
  { id: "5", title: "Go Channel 底层实现", category: "language", mastery: "digesting" },
]

const MASTERY_STYLE: Record<string, string> = {
  pending: "bg-stone-100 text-stone-500",
  digesting: "bg-amber-100 text-amber-600",
  mastered: "bg-emerald-100 text-emerald-600",
}
const MASTERY_LABEL: Record<string, string> = {
  pending: "待吃透",
  digesting: "消化中",
  mastered: "已吃透",
}

export default function LibraryPage() {
  return (
    <div className="p-6">
      <div className="grid gap-3">
        {MOCK_CARDS.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-sm font-medium text-foreground">{card.title}</p>
            <Badge className={MASTERY_STYLE[card.mastery]}>
              {MASTERY_LABEL[card.mastery]}
            </Badge>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        完整知识储备库在 Phase 3 实现
      </p>
    </div>
  )
}
