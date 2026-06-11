import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Card, CardCategory, MasteryStatus } from '@/types'

interface CardFilters {
  category: CardCategory | 'all'
  mastery: MasteryStatus | 'all'
  search: string
}

interface CardStore {
  cards: Card[]
  isLoading: boolean
  error: string | null
  filters: CardFilters

  // ── Computed selectors (derived, not stored) ────────────────────────────────
  // Use these via: useCardStore.getState().getDueToday() etc.
  getDueToday: () => Card[]
  getByMastery: (status: MasteryStatus) => Card[]
  getFiltered: () => Card[]

  // ── Actions ─────────────────────────────────────────────────────────────────
  setCards: (cards: Card[]) => void
  addCard: (card: Card) => void
  updateCard: (id: string, updates: Partial<Card>) => void
  removeCard: (id: string) => void
  setFilters: (filters: Partial<CardFilters>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // ── Remote sync actions (call API then update local state) ─────────────────
  fetchCards: () => Promise<void>
}

export const useCardStore = create<CardStore>()(
  devtools(
    (set, get) => ({
      cards: [],
      isLoading: false,
      error: null,
      filters: {
        category: 'all',
        mastery: 'all',
        search: '',
      },

      getDueToday: () => {
        const now = new Date()
        return get().cards.filter((c) => new Date(c.due) <= now)
      },

      getByMastery: (status) =>
        get().cards.filter((c) => c.masteryStatus === status),

      getFiltered: () => {
        const { cards, filters } = get()
        return cards.filter((card) => {
          if (filters.category !== 'all' && card.category !== filters.category)
            return false
          if (filters.mastery !== 'all' && card.masteryStatus !== filters.mastery)
            return false
          if (filters.search) {
            const q = filters.search.toLowerCase()
            return (
              card.title.toLowerCase().includes(q) ||
              card.tags.some((t) => t.toLowerCase().includes(q))
            )
          }
          return true
        })
      },

      setCards: (cards) => set({ cards }),
      addCard: (card) => set((s) => ({ cards: [card, ...s.cards] })),
      updateCard: (id, updates) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      removeCard: (id) =>
        set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),
      setFilters: (filters) =>
        set((s) => ({ filters: { ...s.filters, ...filters } })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      fetchCards: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/cards')
          if (!res.ok) throw new Error('Failed to fetch cards')
          const cards: Card[] = await res.json()
          set({ cards, isLoading: false })
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false })
        }
      },
    }),
    { name: 'card-store' }
  )
)
