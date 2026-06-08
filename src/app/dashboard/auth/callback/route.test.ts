import { NextRequest } from "next/server"
import { AUTH_SESSION_COOKIE_NAME } from "@/auth/constants"
import { createSessionCookieValue } from "@/auth/session"
import { consumeMagicLinkToken, createSession } from "@/auth/tokens"
import { getAuthEnvs } from "@/envs/server"
import { GET } from "./route"

vi.mock("@/auth/tokens", () => ({
  consumeMagicLinkToken: vi.fn(),
  createSession: vi.fn()
}))

vi.mock("@/envs/server", () => ({
  getAuthEnvs: vi.fn()
}))

const consumeMagicLinkTokenMock = vi.mocked(consumeMagicLinkToken)
const createSessionMock = vi.mocked(createSession)
const getAuthEnvsMock = vi.mocked(getAuthEnvs)

describe("magic-link callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAuthEnvsMock.mockReturnValue({
      ADMIN_EMAIL_ALLOWLIST: ["admin@example.com"],
      RESEND_API_KEY: "re_test_key",
      RESEND_FROM_EMAIL: "Paulo <admin@example.com>",
      SESSION_SECRET: "a-secret-that-is-at-least-32-chars",
      SITE_URL: "https://paulrdrs.com"
    })
  })

  it("redirects missing tokens back to login", async () => {
    const response = await GET(
      new NextRequest("https://paulrdrs.com/dashboard/auth/callback")
    )

    expect(response.headers.get("location")).toBe(
      "https://paulrdrs.com/dashboard/login?error=1"
    )
    expect(createSessionMock).not.toHaveBeenCalled()
  })

  it("redirects expired, missing, or used tokens back to login", async () => {
    consumeMagicLinkTokenMock.mockResolvedValue(undefined)

    const response = await GET(
      new NextRequest("https://paulrdrs.com/dashboard/auth/callback?token=used")
    )

    expect(consumeMagicLinkTokenMock).toHaveBeenCalledWith("used")
    expect(response.headers.get("location")).toBe(
      "https://paulrdrs.com/dashboard/login?error=1"
    )
    expect(createSessionMock).not.toHaveBeenCalled()
  })

  it("creates a session cookie for valid tokens", async () => {
    consumeMagicLinkTokenMock.mockResolvedValue("admin@example.com")
    createSessionMock.mockResolvedValue("session-token")

    const response = await GET(
      new NextRequest(
        "https://paulrdrs.com/dashboard/auth/callback?token=valid"
      )
    )

    expect(createSessionMock).toHaveBeenCalledWith("admin@example.com")
    expect(response.headers.get("location")).toBe(
      "https://paulrdrs.com/dashboard"
    )
    expect(response.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value).toBe(
      createSessionCookieValue(
        "session-token",
        "a-secret-that-is-at-least-32-chars"
      )
    )
  })
})
