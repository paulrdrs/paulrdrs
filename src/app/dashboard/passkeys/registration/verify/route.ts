import type { RegistrationResponseJSON } from "@simplewebauthn/server"
import { type NextRequest, NextResponse } from "next/server"
import { AUTH_SESSION_COOKIE_NAME } from "@/auth/constants"
import {
  verifyBootstrapSecret,
  verifyPasskeyRegistration
} from "@/auth/passkeys"
import {
  createSessionCookieValue,
  getCurrentSession,
  getSessionCookieOptions
} from "@/auth/session"
import { createSession } from "@/auth/tokens"
import { getAuthEnvs } from "@/envs/server"

export const dynamic = "force-dynamic"

export const POST = async (request: NextRequest) => {
  const session = await getCurrentSession()
  const payload = (await request.json().catch(() => null)) as {
    bootstrapSecret?: unknown
    email?: unknown
    response?: RegistrationResponseJSON
  } | null
  const email = session?.email ?? String(payload?.email ?? "")

  if (!payload?.response) {
    return NextResponse.json(
      { error: "Missing passkey response" },
      { status: 400 }
    )
  }

  if (
    !session &&
    !verifyBootstrapSecret(String(payload.bootstrapSecret ?? ""))
  ) {
    return NextResponse.json(
      { error: "Invalid bootstrap secret" },
      { status: 403 }
    )
  }

  try {
    const registeredEmail = await verifyPasskeyRegistration({
      email,
      response: payload.response
    })
    const sessionToken = await createSession(registeredEmail)
    const response = NextResponse.json({ ok: true })

    response.cookies.set(
      AUTH_SESSION_COOKIE_NAME,
      createSessionCookieValue(sessionToken, getAuthEnvs().SESSION_SECRET),
      getSessionCookieOptions()
    )

    return response
  } catch {
    return NextResponse.json(
      { error: "Passkey registration failed" },
      { status: 400 }
    )
  }
}
