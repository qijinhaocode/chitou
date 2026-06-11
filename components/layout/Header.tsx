"use client"

import { usePathname } from "next/navigation"

const ROUTE_META: Record<string, { title: string; subtitle: string }> = {
  "/desk": {
    title: "我的书桌",
    subtitle: "你今天的学习状态一览",
  },
  "/library": {
    title: "知识储备库",
    subtitle: "管理和检索你的所有知识卡片",
  },
  "/practice": {
    title: "专注模式",
    subtitle: "进入心流，把知识真正吃透",
  },
}

export function Header() {
  const pathname = usePathname()
  const key = Object.keys(ROUTE_META).find((k) => pathname.startsWith(k)) ?? "/desk"
  const meta = ROUTE_META[key]

  return (
    <header className="flex h-14 items-center border-b border-border bg-background/80 backdrop-blur-sm px-6 shrink-0">
      <div>
        <h1 className="text-sm font-semibold text-foreground leading-none">{meta.title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{meta.subtitle}</p>
      </div>
    </header>
  )
}
