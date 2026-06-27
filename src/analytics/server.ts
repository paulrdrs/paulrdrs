import "server-only"

import { headers } from "next/headers"
import type { AnalyticsContentType } from "@/analytics/events"
import { normalizeAnalyticsEvent } from "@/analytics/events"
import { createAnalyticsEvent } from "@/db/analytics"
import { getAnalyticsEnvs } from "@/envs/server"

type TrackPageViewInput = {
  contentId?: string | null
  contentType?: AnalyticsContentType | null
  path: string
}

const firstForwardedValue = (value: string | null) =>
  value
    ?.split(",")
    .map((part) => part.trim())
    .find(Boolean) ?? null

export const trackPageView = async ({
  contentId,
  contentType,
  path
}: TrackPageViewInput) => {
  try {
    const headerStore = await headers()
    const userAgent = headerStore.get("user-agent")
    const event = normalizeAnalyticsEvent({
      contentId,
      contentType,
      ipAddress:
        firstForwardedValue(headerStore.get("x-forwarded-for")) ??
        headerStore.get("x-real-ip"),
      path,
      referrer: headerStore.get("referer") ?? headerStore.get("referrer"),
      salt: getAnalyticsEnvs().ANALYTICS_SALT,
      userAgent
    })

    if (!event) {
      return
    }

    await createAnalyticsEvent(event)
  } catch {
    return
  }
}
