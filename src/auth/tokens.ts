import { and, eq, gt, lt } from "drizzle-orm"
import { getDb } from "@/db/client"
import { authSessions } from "@/db/schema"
import {
  AUTH_SESSION_TTL_DAYS,
  SESSION_LAST_SEEN_THROTTLE_MINUTES
} from "./constants"
import { createOpaqueToken, hashToken } from "./crypto"

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const isAllowedAdminEmail = (email: string, allowlist: string[]) => {
  const normalizedEmail = normalizeEmail(email)
  return allowlist.map(normalizeEmail).includes(normalizedEmail)
}

const daysFromNow = (days: number, now = new Date()) =>
  new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

export const createSession = async (email: string, now = new Date()) => {
  const token = createOpaqueToken()

  await getDb()
    .insert(authSessions)
    .values({
      email: normalizeEmail(email),
      expiresAt: daysFromNow(AUTH_SESSION_TTL_DAYS, now),
      tokenHash: hashToken(token)
    })

  return token
}

export const getSessionByToken = async (token: string, now = new Date()) => {
  const [session] = await getDb()
    .select({
      id: authSessions.id,
      email: authSessions.email,
      expiresAt: authSessions.expiresAt,
      lastSeenAt: authSessions.lastSeenAt
    })
    .from(authSessions)
    .where(
      and(
        eq(authSessions.tokenHash, hashToken(token)),
        gt(authSessions.expiresAt, now)
      )
    )
    .limit(1)

  if (!session) {
    return undefined
  }

  const throttleMs = SESSION_LAST_SEEN_THROTTLE_MINUTES * 60 * 1000

  if (now.getTime() - session.lastSeenAt.getTime() >= throttleMs) {
    await getDb()
      .update(authSessions)
      .set({ lastSeenAt: now })
      .where(eq(authSessions.id, session.id))
  }

  return session
}

export const deleteSessionByToken = async (token: string) => {
  await getDb()
    .delete(authSessions)
    .where(eq(authSessions.tokenHash, hashToken(token)))
}

export const deleteExpiredSessions = async (now = new Date()) => {
  await getDb().delete(authSessions).where(lt(authSessions.expiresAt, now))
}
