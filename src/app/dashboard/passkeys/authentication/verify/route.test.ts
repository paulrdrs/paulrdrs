import { NextRequest } from "next/server"
import { AUTH_SESSION_COOKIE_NAME } from "@/auth/constants"
import { verifyPasskeyAuthentication } from "@/auth/passkeys"
import { createSession } from "@/auth/tokens"
import { getAuthEnvs } from "@/envs/server"
import { POST } from "./route"

vi.mock("@/auth/passkeys", () => ({
  verifyPasskeyAuthentication: vi.fn()
}))

vi.mock("@/auth/tokens", () => ({
  createSession: vi.fn()
}))

vi.mock("@/envs/server", () => ({
  getAuthEnvs: vi.fn()
}))

const createSessionMock = vi.mocked(createSession)
const getAuthEnvsMock = vi.mocked(getAuthEnvs)
const verifyPasskeyAuthenticationMock = vi.mocked(verifyPasskeyAuthentication)

describe("passkey authentication verify route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getAuthEnvsMock.mockReturnValue({
      ADMIN_EMAIL_ALLOWLIST: ["admin@example.com"],
      PASSKEY_BOOTSTRAP_SECRET: "a-bootstrap-secret-at-least-32-chars",
      SESSION_SECRET: "a-secret-that-is-at-least-32-chars",
      SITE_URL: "https://paulrdrs.com"
    })
  })

  it("creates a session cookie after a valid passkey response", async () => {
    verifyPasskeyAuthenticationMock.mockResolvedValue("admin@example.com")
    createSessionMock.mockResolvedValue("session-token")

    const response = await POST(
      new NextRequest(
        "https://paulrdrs.com/dashboard/passkeys/authentication/verify",
        {
          body: JSON.stringify({ response: { id: "credential-id" } }),
          method: "POST"
        }
      )
    )

    expect(response.status).toBe(200)
    expect(response.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value).toBeTruthy()
    expect(createSessionMock).toHaveBeenCalledWith("admin@example.com")
  })

  it("rejects missing passkey responses", async () => {
    const response = await POST(
      new NextRequest(
        "https://paulrdrs.com/dashboard/passkeys/authentication/verify",
        {
          body: JSON.stringify({}),
          method: "POST"
        }
      )
    )

    expect(response.status).toBe(400)
  })
})
