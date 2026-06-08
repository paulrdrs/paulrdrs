import { type NextRequest, NextResponse } from "next/server"
import { AUTH_SESSION_COOKIE_NAME } from "@/auth/constants"
import {
  getSessionCookieOptions,
  readSessionTokenFromCookieValue
} from "@/auth/session"
import { deleteSessionByToken } from "@/auth/tokens"
import { getAuthEnvs } from "@/envs/server"

export const POST = async (request: NextRequest) => {
  const authEnvs = getAuthEnvs()
  const sessionToken = readSessionTokenFromCookieValue(
    request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value,
    authEnvs.SESSION_SECRET
  )

  if (sessionToken) {
    await deleteSessionByToken(sessionToken)
  }

  const response = NextResponse.redirect(
    new URL("/dashboard/login", request.url),
    303
  )

  response.cookies.set(AUTH_SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0
  })

  return response
}
