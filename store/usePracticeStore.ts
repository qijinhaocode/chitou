import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  Card,
  EvaluationResult,
  FSRSRating,
  PracticePhase,
  PracticeSession,
  SessionResult,
} from '@/types'
import { scheduleCard } from '@/lib/algorithms/fsrs'
import { useCardStore } from './useCardStore'

interface PracticeStore {
  session: PracticeSession | null
  phase: PracticePhase | 'idle'
  userAnswer: string
  evaluation: EvaluationResult | null
  isEvaluating: boolean

  // ── Derived helpers ──────────────────────────────────────────────────────────
  currentCard: () => Card | null
  progress: () => { current: number; total: number }

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  startSession: (cards: Card[]) => void
  endSession: () => void

  // ── Phase transitions ────────────────────────────────────────────────────────
  advanceToRecall: () => void         // study → recall
  setUserAnswer: (answer: string) => void
  submitAnswer: () => Promise<void>   // recall → evaluating → feedback
  applyRating: (rating: FSRSRating) => Promise<void>  // feedback → (next or complete)
}

let sessionCounter = 0

export const usePracticeStore = create<PracticeStore>()(
  devtools(
    (set, get) => ({
      session: null,
      phase: 'idle',
      userAnswer: '',
      evaluation: null,
      isEvaluating: false,

      currentCard: () => {
        const { session } = get()
        if (!session) return null
        return session.cardQueue[session.currentIndex] ?? null
      },

      progress: () => {
        const { session } = get()
        if (!session) return { current: 0, total: 0 }
        return {
          current: session.currentIndex + 1,
          total: session.cardQueue.length,
        }
      },

      startSession: (cards) => {
        if (cards.length === 0) return
        sessionCounter++
        set({
          session: {
            id: `session-${sessionCounter}`,
            cardQueue: cards,
            currentIndex: 0,
            phase: 'study',
            startedAt: new Date().toISOString(),
            results: [],
          },
          phase: 'study',
          userAnswer: '',
          evaluation: null,
        })
      },

      endSession: () => {
        set({ session: null, phase: 'idle', userAnswer: '', evaluation: null })
      },

      advanceToRecall: () => {
        set((s) => ({
          phase: 'recall',
          session: s.session ? { ...s.session, phase: 'recall' } : null,
        }))
      },

      setUserAnswer: (answer) => set({ userAnswer: answer }),

      submitAnswer: async () => {
        const { session, userAnswer } = get()
        const card = get().currentCard()
        if (!session || !card) return

        set({ isEvaluating: true })

        try {
          const res = await fetch('/api/ai/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: card.question,
              referenceAnswer: card.referenceAnswer,
              userAnswer,
            }),
          })

          if (!res.ok) throw new Error('Evaluation failed')
          const evaluation: EvaluationResult = await res.json()

          set({
            evaluation,
            isEvaluating: false,
            phase: 'feedback',
            session: { ...session, phase: 'feedback' },
          })
        } catch {
          set({ isEvaluating: false })
        }
      },

      applyRating: async (rating) => {
        const { session, evaluation } = get()
        const card = get().currentCard()
        if (!session || !card || !evaluation) return

        // Compute new FSRS schedule
        const updatedFSRS = scheduleCard(card, rating)
        const updatedCard: Card = {
          ...card,
          ...updatedFSRS,
          lastScore: evaluation.overallScore,
          updatedAt: new Date().toISOString(),
        }

        // Persist to server
        await fetch(`/api/cards/${card.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFSRS),
        }).catch(() => {})

        // Update card store optimistically
        useCardStore.getState().updateCard(card.id, updatedCard)

        const result: SessionResult = {
          cardId: card.id,
          evaluation,
          rating,
          answeredAt: new Date().toISOString(),
        }

        const newResults = [...session.results, result]
        const nextIndex = session.currentIndex + 1
        const isComplete = nextIndex >= session.cardQueue.length

        set({
          session: {
            ...session,
            results: newResults,
            currentIndex: isComplete ? session.currentIndex : nextIndex,
            phase: isComplete ? 'complete' : 'study',
          },
          phase: isComplete ? 'complete' : 'study',
          userAnswer: '',
          evaluation: null,
        })
      },
    }),
    { name: 'practice-store' }
  )
)
