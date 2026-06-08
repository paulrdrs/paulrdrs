import { NextRequest } from "next/server"
import { createAnalyticsEvent } from "@/db/analytics"
import { getAuthEnvs } from "@/envs/server"
import { POST } from "./route"

vi.mock("@/db/analytics", () => ({
  createAnalyticsEvent: vi.fn()
}))

vi.mock("@/envs/server", () => ({
  getAuthEnvs: vi.fn()
}))

const createAnalyticsEventMock = vi.mocked(createAnalyticsEvent)
const getAuthEnvsMock = vi.mocked(getAuthEnvs)

const createRequest = (body: unknown) =>
  new NextRequest("https://paulrdrs.com/api/analytics/events", {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      referer: "https://example.com/private/path?token=secret",
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS)",
      "x-forwarded-for": "203.0.113.5, 198.51.100.2"
    },
    method: "POST"
  })

describe("analytics events route", () => {
  beforeEach(() => {
    createAnalyticsEventMock.mockReset()
    getAuthEnvsMock.mockReturnValue({
      ADMIN_EMAIL_ALLOWLIST: ["admin@example.com"],
      PASSKEY_BOOTSTRAP_SECRET: "a-bootstrap-secret-at-least-32-chars",
      SESSION_SECRET: "0123456789abcdef0123456789abcdef",
      SITE_URL: "https://paulrdrs.com"
    })
  })

  it("records normalized analytics events", async () => {
    const response = await POST(
      createRequest({
        contentId: "018f6d2d-1c3b-7f4b-9d2a-8a79d6f13b1c",
        contentType: "post",
        path: "/blog/hello?utm=1"
      })
    )

    expect(response.status).toBe(201)
    expect(createAnalyticsEventMock).toHaveBeenCalledWith({
      contentId: "018f6d2d-1c3b-7f4b-9d2a-8a79d6f13b1c",
      contentType: "post",
      deviceCategory: "mobile",
      occurredAt: expect.any(Date),
      path: "/blog/hello",
      referrerOrigin: "https://example.com",
      visitorHash: expect.any(String)
    })
  })

  it("rejects invalid payloads", async () => {
    const response = await POST(
      createRequest({
        contentType: "post",
        path: ""
      })
    )

    expect(response.status).toBe(400)
    expect(createAnalyticsEventMock).not.toHaveBeenCalled()
  })
})
