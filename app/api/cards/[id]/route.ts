import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getDemoUserId } from "@/lib/db/demo"
import { deriveMasteryStatus } from "@/lib/utils"
import type { Card } from "@/types"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getDemoUserId()
  const { id } = await params
  const body: Partial<Card> = await req.json()

  const updated = await prisma.card.update({
    where: { id, userId },
    data: {
      ...(body.fsrsState       && { fsrsState:      body.fsrsState }),
      ...(body.stability       !== undefined && { stability:     body.stability }),
      ...(body.fsrsDifficulty  !== undefined && { fsrsDifficulty: body.fsrsDifficulty }),
      ...(body.elapsedDays     !== undefined && { elapsedDays:   body.elapsedDays }),
      ...(body.scheduledDays   !== undefined && { scheduledDays: body.scheduledDays }),
      ...(body.reps            !== undefined && { reps:          body.reps }),
      ...(body.lapses          !== undefined && { lapses:        body.lapses }),
      ...(body.due             && { due:           new Date(body.due) }),
      ...(body.lastScore       !== undefined && { lastScore:     body.lastScore }),
      masteryStatus: deriveMasteryStatus(
        body.fsrsState ?? "new",
        body.reps ?? 0,
        body.lastScore ?? null
      ),
    },
  })

  return NextResponse.json({ id: updated.id })
}
