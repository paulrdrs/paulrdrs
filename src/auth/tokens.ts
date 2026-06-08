import { and, eq, gt, isNull } from "drizzle-orm"
import { getDb } from "@/db/client"
import { authSessions, magicLinkTokens } from "@/db/schema"
import {
  AUTH_SESSION_TTL_DAYS,
  MAGIC_LINK_TOKEN_TTL_MINUTES
} from "./constants"
import { createOpaqueToken, hashToken } from "./crypto"

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const isAllowedAdminEmail = (email: string, allowlist: string[]) => {
  const normalizedEmail = normalizeEmail(email)
  return allowlist.map(normalizeEmail).includes(normalizedEmail)
}

const minutesFromNow = (minutes: number, now = new Date()) =>
  new Date(now.getTime() + minutes * 60 * 1000)

const daysFromNow = (days: number, now = new Date()) =>
  new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

export const createMagicLinkToken = async (email: string, now = new Date()) => {
  const token = createOpaqueToken()

  await getDb()
    .insert(magicLinkTokens)
    .values({
      email: normalizeEmail(email),
      expiresAt: minutesFromNow(MAGIC_LINK_TOKEN_TTL_MINUTES, now),
      tokenHash: hashToken(token)
    })

  return token
}

export const consumeMagicLinkToken = async (
  token: string,
  now = new Date()
) => {
  const [existingToken] = await getDb()
    .select({
      id: magicLinkTokens.id,
      email: magicLinkTokens.email
    })
    .from(magicLinkTokens)
    .where(
      and(
        eq(magicLinkTokens.tokenHash, hashToken(token)),
        isNull(magicLinkTokens.consumedAt),
        gt(magicLinkTokens.expiresAt, now)
      )
    )
    .limit(1)

  if (!existingToken) {
    return undefined
  }

  const [consumedToken] = await getDb()
    .update(magicLinkTokens)
    .set({ consumedAt: now })
    .where(
      and(
        eq(magicLinkTokens.id, existingToken.id),
        isNull(magicLinkTokens.consumedAt)
      )
    )
    .returning({ email: magicLinkTokens.email })

  return consumedToken?.email
}

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
      expiresAt: authSessions.expiresAt
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

  await getDb()
    .update(authSessions)
    .set({ lastSeenAt: now })
    .where(eq(authSessions.id, session.id))

  return session
}

export const deleteSessionByToken = async (token: string) => {
  await getDb()
    .delete(authSessions)
    .where(eq(authSessions.tokenHash, hashToken(token)))
}
