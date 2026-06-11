"use client"

import { useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { usePracticeStore } from "@/store/usePracticeStore"
import { StudyPhase } from "./StudyPhase"
import { RecallPhase } from "./RecallPhase"
import { FeedbackPhase } from "./FeedbackPhase"
import { SessionComplete } from "./SessionComplete"
import type { Card } from "@/types"

interface PracticeSessionProps {
  cards: Card[]
}

export function PracticeSession({ cards }: PracticeSessionProps) {
  const {
    session,
    phase,
    userAnswer,
    evaluation,
    isEvaluating,
    startSession,
    advanceToRecall,
    setUserAnswer,
    submitAnswer,
    applyRating,
    endSession,
    currentCard,
    progress,
  } = usePracticeStore()

  // Start session on mount if not already started
  useEffect(() => {
    if (!session) startSession(cards)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const card = currentCard()
  const prog = progress()

  if (!session || !card) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        加载中…
      </div>
    )
  }

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        {phase === "study" && (
          <StudyPhase
            key={`study-${card.id}`}
            card={card}
            progress={prog}
            onReady={advanceToRecall}
          />
        )}

        {phase === "recall" && (
          <RecallPhase
            key={`recall-${card.id}`}
            card={card}
            progress={prog}
            userAnswer={userAnswer}
            isEvaluating={isEvaluating}
            onAnswerChange={setUserAnswer}
            onSubmit={submitAnswer}
            onBack={() => usePracticeStore.setState({ phase: "study" })}
          />
        )}

        {phase === "feedback" && evaluation && (
          <FeedbackPhase
            key={`feedback-${card.id}`}
            card={card}
            evaluation={evaluation}
            userAnswer={userAnswer}
            progress={prog}
            onRate={applyRating}
          />
        )}

        {phase === "complete" && session && (
          <SessionComplete
            key="complete"
            results={session.results}
            onRestart={() => {
              endSession()
              startSession(cards)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
