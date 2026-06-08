import { type NextRequest, NextResponse } from "next/server"
import {
  getPasskeyRegistrationOptions,
  verifyBootstrapSecret
} from "@/auth/passkeys"
import { getCurrentSession } from "@/auth/session"

export const dynamic = "force-dynamic"

export const POST = async (request: NextRequest) => {
  const session = await getCurrentSession()
  const payload = (await request.json().catch(() => null)) as {
    bootstrapSecret?: unknown
    email?: unknown
  } | null
  const email = session?.email ?? String(payload?.email ?? "")

  if (
    !session &&
    !verifyBootstrapSecret(String(payload?.bootstrapSecret ?? ""))
  ) {
    return NextResponse.json(
      { error: "Invalid bootstrap secret" },
      { status: 403 }
    )
  }

  try {
    return NextResponse.json(await getPasskeyRegistrationOptions({ email }))
  } catch {
    return NextResponse.json(
      { error: "Could not start passkey registration" },
      { status: 400 }
    )
  }
}
