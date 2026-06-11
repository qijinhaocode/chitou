"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Library,
  Zap,
  ChevronLeft,
  ChevronRight,
  Settings,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

const NAV_ITEMS = [
  {
    href: "/desk",
    label: "我的书桌",
    icon: LayoutDashboard,
    description: "总览进度与今日任务",
  },
  {
    href: "/library",
    label: "知识储备库",
    icon: Library,
    description: "管理所有知识卡片",
  },
  {
    href: "/practice",
    label: "专注模式",
    icon: Zap,
    description: "进入沉浸式练习",
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "relative flex h-full flex-col border-r border-sidebar-border bg-sidebar",
        className
      )}
    >
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div className="flex h-14 items-center px-4 shrink-0">
        <Link href="/desk" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm">
            <BookOpen className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="font-semibold text-[15px] tracking-tight text-foreground whitespace-nowrap overflow-hidden"
              >
                吃透
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm transition-all",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground/80"
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <motion.span
                  layoutId="sidebar-active-bar"
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.15 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  <p>{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </TooltipContent>
              </Tooltip>
            )
          }

          return <div key={item.href}>{linkContent}</div>
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 py-3 px-2">
        {/* Settings */}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger>
              <Link
                href="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
              >
                <Settings className="h-4 w-4" strokeWidth={2} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">设置</TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href="/settings"
            className="flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4 shrink-0" strokeWidth={2} />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              设置
            </motion.span>
          </Link>
        )}

        {/* User avatar */}
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2 py-1.5 mt-1",
            !collapsed && "hover:bg-sidebar-accent cursor-pointer transition-colors"
          )}
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
              用
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <p className="text-xs font-medium text-foreground truncate">演示用户</p>
                <p className="text-[11px] text-muted-foreground truncate">demo@chitou.app</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Collapse toggle ───────────────────────────────────────────────── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          "absolute -right-3 top-16 z-10",
          "flex h-6 w-6 items-center justify-center rounded-full",
          "border border-sidebar-border bg-background shadow-sm",
          "text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        )}
        aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
        ) : (
          <ChevronLeft className="h-3 w-3" strokeWidth={2.5} />
        )}
      </button>
    </motion.aside>
  )
}
