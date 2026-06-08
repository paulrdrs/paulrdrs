import { cookies } from "next/headers"
import { getAuthEnvs } from "@/envs/server"
import { AUTH_SESSION_COOKIE_NAME, AUTH_SESSION_TTL_DAYS } from "./constants"
import { createSignedValue, verifySignedValue } from "./crypto"
import { deleteSessionByToken, getSessionByToken } from "./tokens"

export const getSessionCookieOptions = () => ({
  httpOnly: true,
  maxAge: AUTH_SESSION_TTL_DAYS * 24 * 60 * 60,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production"
})

export const createSessionCookieValue = (token: string, secret: string) =>
  createSignedValue(token, secret)

export const readSessionTokenFromCookieValue = (
  cookieValue: string | undefined,
  secret: string
) => {
  if (!cookieValue) {
    return undefined
  }

  return verifySignedValue(cookieValue, secret)
}

export const getCurrentSession = async () => {
  const authEnvs = getAuthEnvs()
  const cookieStore = await cookies()
  const token = readSessionTokenFromCookieValue(
    cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value,
    authEnvs.SESSION_SECRET
  )

  if (!token) {
    return undefined
  }

  return getSessionByToken(token)
}

export const clearCurrentSession = async () => {
  const authEnvs = getAuthEnvs()
  const cookieStore = await cookies()
  const token = readSessionTokenFromCookieValue(
    cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value,
    authEnvs.SESSION_SECRET
  )

  if (token) {
    await deleteSessionByToken(token)
  }

  cookieStore.delete(AUTH_SESSION_COOKIE_NAME)
}
