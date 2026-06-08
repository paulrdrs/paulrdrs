import {
  createDailyVisitorHash,
  normalizeAnalyticsEvent,
  normalizeAnalyticsPath,
  normalizeReferrerOrigin,
  toDeviceCategory
} from "./events"

const validContentId = "018f6d2d-1c3b-7f4b-9d2a-8a79d6f13b1c"

describe("analytics event normalization", () => {
  it("normalizes paths to pathnames only", () => {
    expect(normalizeAnalyticsPath("/blog/post?utm=1#top")).toBe("/blog/post")
    expect(normalizeAnalyticsPath("https://paulrdrs.com/projects?x=1")).toBe(
      "/projects"
    )
  })

  it("reduces full referrer URLs to origins", () => {
    expect(
      normalizeReferrerOrigin(
        "https://example.com/some/full/path?utm_source=newsletter"
      )
    ).toBe("https://example.com")
  })

  it("classifies user agents coarsely", () => {
    expect(toDeviceCategory("Mozilla/5.0 (iPhone; CPU iPhone OS)")).toBe(
      "mobile"
    )
    expect(toDeviceCategory("Mozilla/5.0 (iPad; CPU OS)")).toBe("tablet")
    expect(toDeviceCategory("Googlebot/2.1")).toBe("bot")
    expect(toDeviceCategory("Mozilla/5.0 (Macintosh; Intel Mac OS X)")).toBe(
      "desktop"
    )
  })

  it("changes visitor hash by day and salt", () => {
    const firstHash = createDailyVisitorHash({
      ipAddress: "203.0.113.5",
      occurredAt: new Date("2026-06-08T12:00:00.000Z"),
      salt: "first-salt",
      userAgent: "Mozilla/5.0"
    })
    const nextDayHash = createDailyVisitorHash({
      ipAddress: "203.0.113.5",
      occurredAt: new Date("2026-06-09T12:00:00.000Z"),
      salt: "first-salt",
      userAgent: "Mozilla/5.0"
    })
    const secondSaltHash = createDailyVisitorHash({
      ipAddress: "203.0.113.5",
      occurredAt: new Date("2026-06-08T12:00:00.000Z"),
      salt: "second-salt",
      userAgent: "Mozilla/5.0"
    })

    expect(firstHash).not.toBe(nextDayHash)
    expect(firstHash).not.toBe(secondSaltHash)
  })

  it("returns a normalized event without sensitive request details", () => {
    const event = normalizeAnalyticsEvent({
      contentId: validContentId,
      contentType: "post",
      ipAddress: "203.0.113.5",
      occurredAt: new Date("2026-06-08T12:00:00.000Z"),
      path: "/blog/hello?utm=1",
      referrer: "https://example.com/private/path?secret=1",
      salt: "test-salt",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS)"
    })

    expect(event).toEqual({
      contentId: validContentId,
      contentType: "post",
      deviceCategory: "mobile",
      occurredAt: new Date("2026-06-08T12:00:00.000Z"),
      path: "/blog/hello",
      referrerOrigin: "https://example.com",
      visitorHash: expect.any(String)
    })
  })

  it("rejects invalid payloads", () => {
    expect(
      normalizeAnalyticsEvent({ path: "", salt: "test-salt" })
    ).toBeUndefined()
    expect(
      normalizeAnalyticsEvent({
        contentType: "video",
        path: "/blog",
        salt: "test-salt"
      })
    ).toBeUndefined()
    expect(
      normalizeAnalyticsEvent({
        contentId: "not-a-uuid",
        contentType: "post",
        path: "/blog",
        salt: "test-salt"
      })
    ).toBeUndefined()
    expect(
      normalizeAnalyticsEvent({
        contentId: validContentId,
        path: "/blog",
        salt: "test-salt"
      })
    ).toBeUndefined()
  })
})
