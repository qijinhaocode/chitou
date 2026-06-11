/**
 * Thin wrapper around ts-fsrs.
 * Centralizes all scheduling logic so we can swap implementations in one place.
 */
import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  type Card as FSRSCard,
} from 'ts-fsrs'
import type { Card, FSRSRating, FSRSState } from '@/types'

export { Rating as FSRSRatingEnum }

const f = fsrs(generatorParameters())

/** Convert our Card type to ts-fsrs Card type */
export function toFSRSCard(card: Card): FSRSCard {
  return {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.fsrsDifficulty,
    elapsed_days: card.elapsedDays,
    scheduled_days: card.scheduledDays,
    reps: card.reps,
    lapses: card.lapses,
    state: stateToEnum(card.fsrsState),
    last_review: card.updatedAt ? new Date(card.updatedAt) : undefined,
  } as FSRSCard
}

/** Schedule a card after a review and return updated FSRS fields */
export function scheduleCard(
  card: Card,
  rating: FSRSRating,
  now: Date = new Date()
): Partial<Card> {
  const fsrsCard = toFSRSCard(card)
  const schedulingCards = f.repeat(fsrsCard, now)
  // schedulingCards is keyed by Rating numeric enum value (1-4)
  const result = (schedulingCards as unknown as Record<number, { card: FSRSCard }>)[rating]

  return {
    fsrsState: enumToState(result.card.state as unknown as number),
    stability: result.card.stability,
    fsrsDifficulty: result.card.difficulty,
    elapsedDays: result.card.elapsed_days,
    scheduledDays: result.card.scheduled_days,
    reps: result.card.reps,
    lapses: result.card.lapses,
    due: result.card.due.toISOString(),
  }
}

type FSRSDefaults = Pick<
  Card,
  'fsrsState' | 'stability' | 'fsrsDifficulty' | 'elapsedDays' | 'scheduledDays' | 'reps' | 'lapses' | 'due'
>

/** Create default FSRS fields for a brand-new card — all required fields. */
export function newCardDefaults(): FSRSDefaults {
  const empty = createEmptyCard(new Date())
  return {
    fsrsState: 'new',
    stability: empty.stability,
    fsrsDifficulty: empty.difficulty,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    due: empty.due.toISOString(),
  }
}

function stateToEnum(state: FSRSState): number {
  const map: Record<FSRSState, number> = {
    new: 0,
    learning: 1,
    review: 2,
    relearning: 3,
  }
  return map[state]
}

function enumToState(n: number): FSRSState {
  const map: FSRSState[] = ['new', 'learning', 'review', 'relearning']
  return map[n] ?? 'new'
}
