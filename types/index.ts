// ─── FSRS Algorithm Types ────────────────────────────────────────────────────

export type FSRSState = 'new' | 'learning' | 'review' | 'relearning'

// 1=Again, 2=Hard, 3=Good, 4=Easy
export type FSRSRating = 1 | 2 | 3 | 4

// ─── Domain Types ─────────────────────────────────────────────────────────────

export type MasteryStatus = 'pending' | 'digesting' | 'mastered'

export type CardCategory =
  | 'algorithm'
  | 'system_design'
  | 'behavioral'
  | 'language'
  | 'database'
  | 'network'
  | 'os'
  | 'custom'

export type CardDifficulty = 1 | 2 | 3 | 4 | 5

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface User {
  id: string
  clerkId: string
  email: string
  name: string
  avatarUrl: string | null
  targetDate: string | null    // ISO date string, e.g. "2025-09-01"
  dailyGoal: number            // target reviews per day
  createdAt: string
}

/** Atomic knowledge unit — the fundamental record of ChiTou. */
export interface Card {
  id: string
  userId: string

  // Content
  title: string               // Short question headline
  question: string            // Full question prompt shown during practice
  referenceAnswer: string     // Model answer / study material
  tags: string[]
  category: CardCategory
  difficulty: CardDifficulty

  // FSRS scheduling parameters
  fsrsState: FSRSState
  stability: number           // S: how long memory lasts (days)
  fsrsDifficulty: number      // D: intrinsic difficulty 1-10
  elapsedDays: number
  scheduledDays: number
  reps: number                // total reviews
  lapses: number              // number of forgetting events
  due: string                 // ISO datetime string

  // Display / derived
  masteryStatus: MasteryStatus
  lastScore: number | null    // 0-100 from last AI evaluation

  createdAt: string
  updatedAt: string
}

/** One complete review event for a card. */
export interface ReviewLog {
  id: string
  cardId: string
  userId: string

  userAnswer: string

  // AI evaluation dimensions (each 0-100)
  overallScore: number
  accuracyScore: number      // 概念准确度
  completenessScore: number  // 细节完备性
  logicScore: number         // 表达逻辑性
  aiFeedback: string         // What you got right
  aiSuggestion: string       // What to improve

  // FSRS rating applied after evaluation
  rating: FSRSRating

  // FSRS state snapshot before this review
  fsrsStateBefore: {
    state: FSRSState
    stability: number
    difficulty: number
    due: string
  }

  reviewedAt: string
}

// ─── AI Evaluation ────────────────────────────────────────────────────────────

export interface EvaluationResult {
  overallScore: number
  accuracyScore: number
  completenessScore: number
  logicScore: number
  masteryLevel: 'excellent' | 'good' | 'partial' | 'poor'
  aiFeedback: string
  aiSuggestion: string
  suggestedRating: FSRSRating
}

// ─── Dashboard / Stats ────────────────────────────────────────────────────────

export interface UserStats {
  totalCards: number
  masteredCount: number
  digestingCount: number
  pendingCount: number
  dueToday: number
  completedToday: number
  avgDailyProgress: number      // avg cards completed per day (last 7 days)
  estimatedDaysToGoal: number   // BKT-derived estimate (-1 = no target date set)
  masteryRate: number           // 0-1
  streak: number                // consecutive study days
}

// ─── Practice Session ─────────────────────────────────────────────────────────

export type PracticePhase = 'study' | 'recall' | 'feedback' | 'complete'

export interface PracticeSession {
  id: string
  cardQueue: Card[]
  currentIndex: number
  phase: PracticePhase
  startedAt: string
  results: SessionResult[]
}

export interface SessionResult {
  cardId: string
  evaluation: EvaluationResult
  rating: FSRSRating
  answeredAt: string
}
