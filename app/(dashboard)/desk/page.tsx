import { StatCard } from "@/components/desk/StatCard"
import { MasteryRing } from "@/components/desk/MasteryRing"
import { CountdownCard } from "@/components/desk/CountdownCard"
import { TodayQueue } from "@/components/desk/TodayQueue"
import { WeeklyActivity } from "@/components/desk/WeeklyActivity"
import { buildWeekData } from "@/lib/desk"
import { estimateDaysToGoal, learningVelocity } from "@/lib/algorithms/bkt"
import type { Card } from "@/types"
import { newCardDefaults } from "@/lib/algorithms/fsrs"

// ── Mock data (Phase 1 MVP) ────────────────────────────────────────────────
// In Phase 2 this is replaced by: const stats = await fetchUserStats(userId)

const MOCK_STATS = {
  totalCards:       74,
  masteredCount:    38,
  digestingCount:   18,
  pendingCount:     18,
  streak:           12,
  avgDailyProgress: 6.4,
  targetDate:       "2025-09-01",
}

// Review history for BKT velocity calculation (last 14 days)
const MOCK_REVIEW_HISTORY = [
  { date: "2025-06-01", score: 72 },
  { date: "2025-06-02", score: 80 },
  { date: "2025-06-03", score: 65 },
  { date: "2025-06-04", score: 88 },
  { date: "2025-06-05", score: 75 },
  { date: "2025-06-06", score: 90 },
  { date: "2025-06-07", score: 82 },
  { date: "2025-06-08", score: 70 },
  { date: "2025-06-09", score: 85 },
  { date: "2025-06-10", score: 78 },
  { date: "2025-06-11", score: 92 },
]

// Weekly activity counts keyed by ISO date
const MOCK_WEEKLY: Record<string, number> = {
  "2025-06-05": 5,
  "2025-06-06": 8,
  "2025-06-07": 3,
  "2025-06-08": 7,
  "2025-06-09": 0,
  "2025-06-10": 6,
  "2025-06-11": 4,
}

// Today's due cards
const NOW = new Date().toISOString()
const DUE_CARDS: Card[] = [
  {
    id: "c1", userId: "demo",
    title: "解释 TCP 三次握手",
    question: "请详细解释 TCP 建立连接的三次握手过程。",
    referenceAnswer: "", tags: ["TCP", "网络"],
    category: "network", difficulty: 2,
    masteryStatus: "digesting", lastScore: 68,
    createdAt: NOW, updatedAt: NOW,
    ...newCardDefaults(),
  },
  {
    id: "c2", userId: "demo",
    title: "React Fiber 架构原理",
    question: "React 16 引入 Fiber 架构解决了什么问题？",
    referenceAnswer: "", tags: ["React", "Fiber"],
    category: "language", difficulty: 4,
    masteryStatus: "pending", lastScore: null,
    createdAt: NOW, updatedAt: NOW,
    ...newCardDefaults(),
  },
  {
    id: "c3", userId: "demo",
    title: "Go Channel 底层实现",
    question: "请解释 Go Channel 的 hchan 结构及发送阻塞流程。",
    referenceAnswer: "", tags: ["Go", "Channel"],
    category: "language", difficulty: 5,
    masteryStatus: "digesting", lastScore: 71,
    createdAt: NOW, updatedAt: NOW,
    ...newCardDefaults(),
  },
  {
    id: "c4", userId: "demo",
    title: "数据库 B+ 树索引",
    question: "为什么 InnoDB 使用 B+ 树而非哈希表？",
    referenceAnswer: "", tags: ["MySQL", "索引"],
    category: "database", difficulty: 3,
    masteryStatus: "pending", lastScore: null,
    createdAt: NOW, updatedAt: NOW,
    ...newCardDefaults(),
  },
  {
    id: "c5", userId: "demo",
    title: "设计短链接服务",
    question: "请设计一个支持 1 亿 DAU 的短链接系统。",
    referenceAnswer: "", tags: ["系统设计"],
    category: "system-design", difficulty: 4,
    masteryStatus: "pending", lastScore: null,
    createdAt: NOW, updatedAt: NOW,
    ...newCardDefaults(),
  },
  {
    id: "c6", userId: "demo",
    title: "讲一个挑战项目（STAR）",
    question: "请用 STAR 法则描述你最有挑战的一个项目。",
    referenceAnswer: "", tags: ["行为面试"],
    category: "behavioral", difficulty: 2,
    masteryStatus: "digesting", lastScore: 82,
    createdAt: NOW, updatedAt: NOW,
    ...newCardDefaults(),
  },
  {
    id: "c7", userId: "demo",
    title: "Redis 持久化方案",
    question: "对比 RDB 与 AOF 两种持久化方案的优劣。",
    referenceAnswer: "", tags: ["Redis"],
    category: "database", difficulty: 3,
    masteryStatus: "pending", lastScore: null,
    createdAt: NOW, updatedAt: NOW,
    ...newCardDefaults(),
  },
  {
    id: "c8", userId: "demo",
    title: "进程 vs 线程 vs 协程",
    question: "请对比进程、线程和协程，并说明各自适用场景。",
    referenceAnswer: "", tags: ["操作系统"],
    category: "os", difficulty: 3,
    masteryStatus: "pending", lastScore: null,
    createdAt: NOW, updatedAt: NOW,
    ...newCardDefaults(),
  },
]

export default function DeskPage() {
  const { totalCards, masteredCount, digestingCount, pendingCount,
          streak, avgDailyProgress, targetDate } = MOCK_STATS

  // BKT-based ETA
  const masteryRate = totalCards > 0 ? masteredCount / totalCards : 0
  const velocity    = learningVelocity(MOCK_REVIEW_HISTORY)
  const etaDays     = estimateDaysToGoal(masteryRate, velocity)

  const weekData = buildWeekData(MOCK_WEEKLY)

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">

        {/* ── Row 1: 4 stat cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="总卡片"
            value={totalCards}
            sub="知识原子总量"
            accent="stone"
            delay={0}
          />
          <StatCard
            label="已吃透"
            value={masteredCount}
            sub={`占比 ${Math.round((masteredCount / totalCards) * 100)}%`}
            accent="emerald"
            delay={0.07}
          />
          <StatCard
            label="消化中"
            value={digestingCount}
            sub="需持续复习"
            accent="amber"
            delay={0.14}
          />
          <StatCard
            label="待吃透"
            value={pendingCount}
            sub="尚未开始"
            accent="rose"
            delay={0.21}
          />
        </div>

        {/* ── Row 2: Left panel (ring + countdown) | Right (today queue) ── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          {/* Left: mastery ring + BKT countdown */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <MasteryRing
                masteredCount={masteredCount}
                digestingCount={digestingCount}
                pendingCount={pendingCount}
                total={totalCards}
              />
            </div>
            <CountdownCard
              etaDays={etaDays}
              streak={streak}
              avgDailyProgress={avgDailyProgress}
              targetDate={targetDate}
            />
          </div>

          {/* Right: today's queue */}
          <div className="md:col-span-3">
            <TodayQueue cards={DUE_CARDS} />
          </div>
        </div>

        {/* ── Row 3: Weekly activity ────────────────────────────────────── */}
        <WeeklyActivity data={weekData} />

      </div>
    </div>
  )
}
