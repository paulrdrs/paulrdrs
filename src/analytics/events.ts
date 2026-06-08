import { createHmac } from "node:crypto"

export const analyticsContentTypes = ["page", "post", "project"] as const
export const deviceCategories = [
  "bot",
  "desktop",
  "mobile",
  "tablet",
  "unknown"
] as const

export type AnalyticsContentType = (typeof analyticsContentTypes)[number]
export type DeviceCategory = (typeof deviceCategories)[number]

type NormalizeAnalyticsEventInput = {
  contentId?: string | null
  contentType?: string | null
  ipAddress?: string | null
  occurredAt?: Date
  path: string
  referrer?: string | null
  salt: string
  userAgent?: string | null
}

export type NormalizedAnalyticsEvent = {
  contentId: string | null
  contentType: AnalyticsContentType | null
  deviceCategory: DeviceCategory
  occurredAt: Date
  path: string
  referrerOrigin: string | null
  visitorHash: string
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const toDateKey = (date: Date) => date.toISOString().slice(0, 10)

export const normalizeAnalyticsPath = (value: string) => {
  const trimmed = value.trim()

  if (!trimmed || trimmed.length > 2048) {
    return undefined
  }

  try {
    const url = trimmed.startsWith("/")
      ? new URL(trimmed, "https://local.invalid")
      : new URL(trimmed)

    if (!url.pathname.startsWith("/")) {
      return undefined
    }

    return url.pathname
  } catch {
    return undefined
  }
}

export const normalizeReferrerOrigin = (value?: string | null) => {
  if (!value) {
    return null
  }

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export const toDeviceCategory = (userAgent?: string | null): DeviceCategory => {
  if (!userAgent) {
    return "unknown"
  }

  const normalizedUserAgent = userAgent.toLowerCase()

  if (/bot|crawler|spider|crawling/.test(normalizedUserAgent)) {
    return "bot"
  }

  if (/ipad|tablet|kindle|silk/.test(normalizedUserAgent)) {
    return "tablet"
  }

  if (/mobi|iphone|android/.test(normalizedUserAgent)) {
    return "mobile"
  }

  return "desktop"
}

export const createDailyVisitorHash = ({
  ipAddress,
  occurredAt,
  salt,
  userAgent
}: {
  ipAddress?: string | null
  occurredAt: Date
  salt: string
  userAgent?: string | null
}) =>
  createHmac("sha256", salt)
    .update(toDateKey(occurredAt))
    .update("\n")
    .update(ipAddress ?? "")
    .update("\n")
    .update(userAgent ?? "")
    .digest("hex")

export const normalizeAnalyticsEvent = ({
  contentId,
  contentType,
  ipAddress,
  occurredAt = new Date(),
  path,
  referrer,
  salt,
  userAgent
}: NormalizeAnalyticsEventInput): NormalizedAnalyticsEvent | undefined => {
  const normalizedPath = normalizeAnalyticsPath(path)

  if (!normalizedPath) {
    return undefined
  }

  const normalizedContentType =
    contentType &&
    analyticsContentTypes.includes(contentType as AnalyticsContentType)
      ? (contentType as AnalyticsContentType)
      : null

  if (contentType && !normalizedContentType) {
    return undefined
  }

  const normalizedContentId = contentId || null

  if (normalizedContentId && !uuidPattern.test(normalizedContentId)) {
    return undefined
  }

  if (normalizedContentId && !normalizedContentType) {
    return undefined
  }

  return {
    contentId: normalizedContentId,
    contentType: normalizedContentType,
    deviceCategory: toDeviceCategory(userAgent),
    occurredAt,
    path: normalizedPath,
    referrerOrigin: normalizeReferrerOrigin(referrer),
    visitorHash: createDailyVisitorHash({
      ipAddress,
      occurredAt,
      salt,
      userAgent
    })
  }
}
