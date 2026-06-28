import { timingSafeEqual } from "node:crypto"
import { type NextRequest, NextResponse } from "next/server"
import { getNotionEnvs } from "@/envs/server"
import { runNotionSync } from "@/notion/sync"

export const dynamic = "force-dynamic"

const getProvidedSecret = (request: NextRequest) =>
  request.headers.get("x-jobs-secret") ??
  request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
  ""

const isAuthorized = (provided: string, secret: string) => {
  const providedBuffer = Buffer.from(provided)
  const secretBuffer = Buffer.from(secret)

  return (
    providedBuffer.length === secretBuffer.length &&
    timingSafeEqual(providedBuffer, secretBuffer)
  )
}

export const POST = async (request: NextRequest) => {
  const { JOBS_SECRET } = getNotionEnvs()

  if (!isAuthorized(getProvidedSecret(request), JOBS_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const summary = await runNotionSync()

  return NextResponse.json(summary)
}
