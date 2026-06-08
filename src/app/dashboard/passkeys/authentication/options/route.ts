import { NextResponse } from "next/server"
import { getPasskeyAuthenticationOptions } from "@/auth/passkeys"

export const dynamic = "force-dynamic"

export const POST = async () => {
  try {
    return NextResponse.json(await getPasskeyAuthenticationOptions())
  } catch {
    return NextResponse.json(
      { error: "Could not start passkey sign-in" },
      { status: 400 }
    )
  }
}
