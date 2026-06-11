import { Zap } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"

export default function PracticePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Zap className="h-8 w-8 text-primary" strokeWidth={2.5} />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">准备好专注了吗？</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          进入心流状态，把每一道题真正吃透。
        </p>
      </div>
      <Link href="/practice/session" className={buttonVariants({ size: "lg" }) + " gap-2"}>
        <Zap className="h-4 w-4" strokeWidth={2.5} />
        开始练习
      </Link>
      <p className="text-xs text-muted-foreground">包含 3 张练习卡片，AI 判卷 + FSRS 自动调度</p>
    </div>
  )
}
