/**
 * Returns the demo user's DB id.
 * Replaced by real Clerk-based auth lookup in Phase 3+.
 */
import { prisma } from "./prisma"

let cachedId: string | null = null

export async function getDemoUserId(): Promise<string> {
  if (cachedId) return cachedId
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: "demo@chitou.app" },
    select: { id: true },
  })
  cachedId = user.id
  return user.id
}
