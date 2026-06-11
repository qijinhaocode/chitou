import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MasteryStatus, CardCategory, FSRSState } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Derive display mastery status from FSRS state + score */
export function deriveMasteryStatus(
  fsrsState: FSRSState,
  reps: number,
  lastScore: number | null
): MasteryStatus {
  if (fsrsState === 'new' || reps === 0) return 'pending'
  if (fsrsState === 'review' && (lastScore ?? 0) >= 75) return 'mastered'
  return 'digesting'
}

/** Format relative date for display (e.g. "Due in 3 days", "Due today") */
export function formatDueDate(dueISO: string): string {
  const now = new Date()
  const due = new Date(dueISO)
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  return `Due in ${diffDays}d`
}

export const CATEGORY_LABELS: Record<CardCategory, string> = {
  algorithm: '算法',
  'system-design': '系统设计',
  behavioral: '行为问题',
  language: '编程语言',
  database: '数据库',
  network: '计算机网络',
  os: '操作系统',
  custom: '自定义',
}

export const CATEGORY_COLORS: Record<CardCategory, string> = {
  algorithm: 'bg-blue-100 text-blue-700',
  'system-design': 'bg-purple-100 text-purple-700',
  behavioral: 'bg-pink-100 text-pink-700',
  language: 'bg-green-100 text-green-700',
  database: 'bg-yellow-100 text-yellow-700',
  network: 'bg-cyan-100 text-cyan-700',
  os: 'bg-orange-100 text-orange-700',
  custom: 'bg-stone-100 text-stone-600',
}
