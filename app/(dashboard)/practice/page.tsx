import { Zap, BrainCircuit } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function PracticePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center p-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">选择练习模式</h2>
        <p className="text-sm text-muted-foreground mt-1">两种方式，都能让知识真正进入肌肉记忆</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {/* 专注模式 */}
        <Link
          href="/practice/session"
          className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
            <Zap className="h-7 w-7 text-primary" strokeWidth={2} />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">专注模式</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              看资料建立印象 → 闭卷输出 → AI 三维判卷 → FSRS 智能调度
            </p>
          </div>
          <span className={cn(buttonVariants({ size: "sm" }), "w-full gap-1.5 mt-auto")}>
            <Zap className="h-3.5 w-3.5" />
            开始练习
          </span>
        </Link>

        {/* 面试官模式 */}
        <Link
          href="/practice/interview"
          className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
            <BrainCircuit className="h-7 w-7 text-violet-600 dark:text-violet-400" strokeWidth={2} />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">面试官模式</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              AI 扮演字节跳动面试官，4 轮深度追问，最后给出综合评价报告
            </p>
          </div>
          <span className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full gap-1.5 mt-auto border-violet-300 text-violet-600 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400"
          )}>
            <BrainCircuit className="h-3.5 w-3.5" />
            开始模拟面试
          </span>
        </Link>
      </div>
    </div>
  )
}
