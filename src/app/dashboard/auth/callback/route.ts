import { type NextRequest, NextResponse } from "next/server"
import { AUTH_SESSION_COOKIE_NAME } from "@/auth/constants"
import {
  createSessionCookieValue,
  getSessionCookieOptions
} from "@/auth/session"
import { consumeMagicLinkToken, createSession } from "@/auth/tokens"
import { getAuthEnvs } from "@/envs/server"

export const dynamic = "force-dynamic"

export const GET = async (request: NextRequest) => {
  const authEnvs = getAuthEnvs()
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(
      new URL("/dashboard/login?error=1", request.url)
    )
  }

  const email = await consumeMagicLinkToken(token)

  if (!email) {
    return NextResponse.redirect(
      new URL("/dashboard/login?error=1", request.url)
    )
  }

  const sessionToken = await createSession(email)
  const response = NextResponse.redirect(new URL("/dashboard", request.url))

  response.cookies.set(
    AUTH_SESSION_COOKIE_NAME,
    createSessionCookieValue(sessionToken, authEnvs.SESSION_SECRET),
    getSessionCookieOptions()
  )

  return response
}
