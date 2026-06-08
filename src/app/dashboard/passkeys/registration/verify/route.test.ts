import { NextRequest } from "next/server"
import { AUTH_SESSION_COOKIE_NAME } from "@/auth/constants"
import {
  verifyBootstrapSecret,
  verifyPasskeyRegistration
} from "@/auth/passkeys"
import { getCurrentSession } from "@/auth/session"
import { createSession } from "@/auth/tokens"
import { getAuthEnvs } from "@/envs/server"
import { POST } from "./route"

vi.mock("@/auth/passkeys", () => ({
  verifyBootstrapSecret: vi.fn(),
  verifyPasskeyRegistration: vi.fn()
}))

vi.mock("@/auth/session", () => ({
  getCurrentSession: vi.fn(),
  createSessionCookieValue: (token: string) => `signed.${token}`,
  getSessionCookieOptions: () => ({
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: false
  })
}))

vi.mock("@/auth/tokens", () => ({
  createSession: vi.fn()
}))

vi.mock("@/envs/server", () => ({
  getAuthEnvs: vi.fn()
}))

const createSessionMock = vi.mocked(createSession)
const getAuthEnvsMock = vi.mocked(getAuthEnvs)
const getCurrentSessionMock = vi.mocked(getCurrentSession)
const verifyBootstrapSecretMock = vi.mocked(verifyBootstrapSecret)
const verifyPasskeyRegistrationMock = vi.mocked(verifyPasskeyRegistration)

describe("passkey registration verify route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAuthEnvsMock.mockReturnValue({
      ADMIN_EMAIL_ALLOWLIST: ["admin@example.com"],
      PASSKEY_BOOTSTRAP_SECRET: "a-bootstrap-secret-at-least-32-chars",
      SESSION_SECRET: "a-secret-that-is-at-least-32-chars",
      SITE_URL: "https://paulrdrs.com"
    })
  })

  it("creates a session after bootstrap registration", async () => {
    getCurrentSessionMock.mockResolvedValue(undefined)
    verifyBootstrapSecretMock.mockReturnValue(true)
    verifyPasskeyRegistrationMock.mockResolvedValue("admin@example.com")
    createSessionMock.mockResolvedValue("session-token")

    const response = await POST(
      new NextRequest(
        "https://paulrdrs.com/dashboard/passkeys/registration/verify",
        {
          body: JSON.stringify({
            bootstrapSecret: "a-bootstrap-secret-at-least-32-chars",
            email: "admin@example.com",
            response: { id: "credential-id" }
          }),
          method: "POST"
        }
      )
    )

    expect(response.status).toBe(200)
    expect(response.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value).toBe(
      "signed.session-token"
    )
    expect(verifyPasskeyRegistrationMock).toHaveBeenCalledWith({
      email: "admin@example.com",
      response: { id: "credential-id" }
    })
  })

  it("rejects invalid bootstrap registration", async () => {
    getCurrentSessionMock.mockResolvedValue(undefined)
    verifyBootstrapSecretMock.mockReturnValue(false)

    const response = await POST(
      new NextRequest(
        "https://paulrdrs.com/dashboard/passkeys/registration/verify",
        {
          body: JSON.stringify({
            bootstrapSecret: "wrong",
            email: "admin@example.com",
            response: { id: "credential-id" }
          }),
          method: "POST"
        }
      )
    )

    expect(response.status).toBe(403)
  })
})
