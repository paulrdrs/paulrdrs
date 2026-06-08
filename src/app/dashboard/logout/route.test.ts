import { NextRequest } from "next/server"
import { AUTH_SESSION_COOKIE_NAME } from "@/auth/constants"
import { createSessionCookieValue } from "@/auth/session"
import { deleteSessionByToken } from "@/auth/tokens"
import { getAuthEnvs } from "@/envs/server"
import { POST } from "./route"

vi.mock("@/auth/tokens", () => ({
  deleteSessionByToken: vi.fn()
}))

vi.mock("@/envs/server", () => ({
  getAuthEnvs: vi.fn()
}))

const deleteSessionByTokenMock = vi.mocked(deleteSessionByToken)
const getAuthEnvsMock = vi.mocked(getAuthEnvs)

describe("logout route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAuthEnvsMock.mockReturnValue({
      ADMIN_EMAIL_ALLOWLIST: ["admin@example.com"],
      PASSKEY_BOOTSTRAP_SECRET: "a-bootstrap-secret-at-least-32-chars",
      SESSION_SECRET: "a-secret-that-is-at-least-32-chars",
      SITE_URL: "https://paulrdrs.com"
    })
  })

  it("deletes the server-side session and clears the cookie", async () => {
    const cookieValue = createSessionCookieValue(
      "session-token",
      "a-secret-that-is-at-least-32-chars"
    )
    const request = new NextRequest("https://paulrdrs.com/dashboard/logout", {
      headers: {
        cookie: `${AUTH_SESSION_COOKIE_NAME}=${cookieValue}`
      }
    })

    const response = await POST(request)

    expect(deleteSessionByTokenMock).toHaveBeenCalledWith("session-token")
    expect(response.headers.get("location")).toBe(
      "https://paulrdrs.com/dashboard/login"
    )
    expect(response.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value).toBe("")
  })
})
