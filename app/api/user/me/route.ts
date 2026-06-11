import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { getDemoUserId } from "@/lib/db/demo"

export async function GET() {
  const userId = await getDemoUserId()
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true, clerkId: true, email: true, name: true,
      avatarUrl: true, targetDate: true, dailyGoal: true, createdAt: true,
    },
  })
  return NextResponse.json({
    ...user,
    targetDate: user.targetDate?.toISOString() ?? null,
    createdAt:  user.createdAt.toISOString(),
  })
}

export async function PATCH(req: Request) {
  const userId = await getDemoUserId()
  const { targetDate, dailyGoal } = await req.json()

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
      ...(dailyGoal  !== undefined && { dailyGoal }),
    },
  })

  return NextResponse.json({ id: updated.id })
}
