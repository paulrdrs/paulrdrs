import { type NextRequest, NextResponse } from "next/server"
import { normalizeAnalyticsEvent } from "@/analytics/events"
import { createAnalyticsEvent } from "@/db/analytics"
import { getAnalyticsEnvs } from "@/envs/server"

export const dynamic = "force-dynamic"

const firstForwardedValue = (value: string | null) =>
  value
    ?.split(",")
    .map((part) => part.trim())
    .find(Boolean) ?? null

export const POST = async (request: NextRequest) => {
  const payload = (await request.json().catch(() => null)) as {
    contentId?: unknown
    contentType?: unknown
    path?: unknown
  } | null

  const event = normalizeAnalyticsEvent({
    contentId:
      typeof payload?.contentId === "string" ? payload.contentId : null,
    contentType:
      typeof payload?.contentType === "string" ? payload.contentType : null,
    ipAddress:
      firstForwardedValue(request.headers.get("x-forwarded-for")) ??
      request.headers.get("x-real-ip"),
    path: typeof payload?.path === "string" ? payload.path : "",
    referrer: request.headers.get("referer") ?? request.headers.get("referrer"),
    salt: getAnalyticsEnvs().ANALYTICS_SALT,
    userAgent: request.headers.get("user-agent")
  })

  if (!event) {
    return NextResponse.json(
      { error: "Invalid analytics event" },
      { status: 400 }
    )
  }

  await createAnalyticsEvent(event)

  return NextResponse.json({ ok: true }, { status: 201 })
}
