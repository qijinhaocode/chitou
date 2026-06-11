/**
 * Bayesian Knowledge Tracing — estimates the probability that a user has
 * "mastered" a knowledge domain, and projects days-to-readiness.
 *
 * Parameters use standard BKT defaults from academic literature.
 */

interface BKTParams {
  pLearn: number    // P(Learn) — probability of transitioning to mastered per review
  pGuess: number    // P(Guess) — probability of correct answer when not mastered
  pSlip: number     // P(Slip)  — probability of wrong answer when mastered
  pInit: number     // P(Know)  — prior probability of mastery
}

const DEFAULT_PARAMS: BKTParams = {
  pLearn: 0.2,
  pGuess: 0.25,
  pSlip: 0.1,
  pInit: 0.0,
}

/**
 * Update mastery probability after a single observation.
 * @param pMastery current P(mastered) for this knowledge component
 * @param correct  whether the user's answer was considered correct
 */
export function bktUpdate(
  pMastery: number,
  correct: boolean,
  params: BKTParams = DEFAULT_PARAMS
): number {
  const { pLearn, pGuess, pSlip } = params

  // Likelihood of this observation given mastery state
  const pCorrectGivenMastered = 1 - pSlip
  const pCorrectGivenNotMastered = pGuess

  const pObs = correct
    ? pCorrectGivenMastered * pMastery + pCorrectGivenNotMastered * (1 - pMastery)
    : (1 - pCorrectGivenMastered) * pMastery + (1 - pCorrectGivenNotMastered) * (1 - pMastery)

  // Posterior P(mastered | observation) using Bayes
  const pMasteredGivenObs = correct
    ? (pCorrectGivenMastered * pMastery) / pObs
    : ((1 - pCorrectGivenMastered) * pMastery) / pObs

  // Apply learning transition
  return pMasteredGivenObs + (1 - pMasteredGivenObs) * pLearn
}

/**
 * Compute learning velocity: average mastery gain per day over a sliding window.
 * @param reviewScores  array of {date: ISO string, score: 0-100} sorted ascending
 * @param windowDays    how many recent days to average over
 */
export function learningVelocity(
  reviewScores: Array<{ date: string; score: number }>,
  windowDays = 7
): number {
  if (reviewScores.length < 2) return 0.05 // default 5% per day if no history

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - windowDays)
  const recent = reviewScores.filter((r) => new Date(r.date) >= cutoff)

  if (recent.length < 2) return 0.05

  const avgScore = recent.reduce((sum, r) => sum + r.score, 0) / recent.length
  // Normalise: treat 100-score reviews as +pLearn mastery gain each
  return (DEFAULT_PARAMS.pLearn * avgScore) / 100
}

/**
 * Estimate the number of days needed to reach targetMastery given current
 * aggregate mastery rate and learning velocity.
 *
 * @param currentMasteryRate  fraction of cards mastered (0-1)
 * @param velocity            mastery gain per day (from learningVelocity)
 * @param targetMastery       goal mastery fraction (default 0.85)
 */
export function estimateDaysToGoal(
  currentMasteryRate: number,
  velocity: number,
  targetMastery = 0.85
): number {
  if (currentMasteryRate >= targetMastery) return 0
  if (velocity <= 0) return -1  // can't estimate

  const remaining = targetMastery - currentMasteryRate
  return Math.ceil(remaining / velocity)
}
