import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User, UserStats } from '@/types'
import { learningVelocity, estimateDaysToGoal } from '@/lib/algorithms/bkt'

interface UserStore {
  user: User | null
  stats: UserStats | null
  isLoading: boolean

  // ── Actions ─────────────────────────────────────────────────────────────────
  setUser: (user: User | null) => void
  setStats: (stats: UserStats | null) => void

  fetchUser: () => Promise<void>
  fetchStats: () => Promise<void>
  updateTargetDate: (date: string) => Promise<void>
  updateDailyGoal: (goal: number) => Promise<void>

  // ── BKT convenience ─────────────────────────────────────────────────────────
  computeETA: (
    reviewHistory: Array<{ date: string; score: number }>
  ) => number
}

export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      user: null,
      stats: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setStats: (stats) => set({ stats }),

      fetchUser: async () => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/user/me')
          if (!res.ok) return
          const user: User = await res.json()
          set({ user, isLoading: false })
        } catch {
          set({ isLoading: false })
        }
      },

      fetchStats: async () => {
        try {
          const res = await fetch('/api/user/stats')
          if (!res.ok) return
          const stats: UserStats = await res.json()
          set({ stats })
        } catch {}
      },

      updateTargetDate: async (date) => {
        const { user } = get()
        if (!user) return
        set({ user: { ...user, targetDate: date } })
        await fetch('/api/user/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetDate: date }),
        })
      },

      updateDailyGoal: async (goal) => {
        const { user } = get()
        if (!user) return
        set({ user: { ...user, dailyGoal: goal } })
        await fetch('/api/user/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dailyGoal: goal }),
        })
      },

      computeETA: (reviewHistory) => {
        const { stats } = get()
        if (!stats) return -1
        const velocity = learningVelocity(reviewHistory)
        return estimateDaysToGoal(stats.masteryRate, velocity)
      },
    }),
    { name: 'user-store' }
  )
)
