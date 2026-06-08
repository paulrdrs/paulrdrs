import type { AuthenticationResponseJSON } from "@simplewebauthn/server"
import { type NextRequest, NextResponse } from "next/server"
import { AUTH_SESSION_COOKIE_NAME } from "@/auth/constants"
import { verifyPasskeyAuthentication } from "@/auth/passkeys"
import {
  createSessionCookieValue,
  getSessionCookieOptions
} from "@/auth/session"
import { createSession } from "@/auth/tokens"
import { getAuthEnvs } from "@/envs/server"

export const dynamic = "force-dynamic"

export const POST = async (request: NextRequest) => {
  const payload = (await request.json().catch(() => null)) as {
    response?: AuthenticationResponseJSON
  } | null

  if (!payload?.response) {
    return NextResponse.json(
      { error: "Missing passkey response" },
      { status: 400 }
    )
  }

  try {
    const email = await verifyPasskeyAuthentication({
      response: payload.response
    })
    const sessionToken = await createSession(email)
    const response = NextResponse.json({ ok: true })

    response.cookies.set(
      AUTH_SESSION_COOKIE_NAME,
      createSessionCookieValue(sessionToken, getAuthEnvs().SESSION_SECRET),
      getSessionCookieOptions()
    )

    return response
  } catch {
    return NextResponse.json(
      { error: "Passkey sign-in failed" },
      { status: 400 }
    )
  }
}
