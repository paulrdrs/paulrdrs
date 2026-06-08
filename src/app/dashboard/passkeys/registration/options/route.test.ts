import { NextRequest } from "next/server"
import {
  getPasskeyRegistrationOptions,
  verifyBootstrapSecret
} from "@/auth/passkeys"
import { getCurrentSession } from "@/auth/session"
import { POST } from "./route"

vi.mock("@/auth/passkeys", () => ({
  getPasskeyRegistrationOptions: vi.fn(),
  verifyBootstrapSecret: vi.fn()
}))

vi.mock("@/auth/session", () => ({
  getCurrentSession: vi.fn()
}))

const getCurrentSessionMock = vi.mocked(getCurrentSession)
const getPasskeyRegistrationOptionsMock = vi.mocked(
  getPasskeyRegistrationOptions
)
const verifyBootstrapSecretMock = vi.mocked(verifyBootstrapSecret)

describe("passkey registration options route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("uses the current session for authenticated registration", async () => {
    getCurrentSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      id: "session-id"
    })
    getPasskeyRegistrationOptionsMock.mockResolvedValue({
      challenge: "challenge"
    } as Awaited<ReturnType<typeof getPasskeyRegistrationOptions>>)

    const response = await POST(
      new NextRequest(
        "https://paulrdrs.com/dashboard/passkeys/registration/options",
        {
          body: JSON.stringify({}),
          method: "POST"
        }
      )
    )

    expect(response.status).toBe(200)
    expect(getPasskeyRegistrationOptionsMock).toHaveBeenCalledWith({
      email: "admin@example.com"
    })
  })

  it("rejects invalid bootstrap setup", async () => {
    getCurrentSessionMock.mockResolvedValue(undefined)
    verifyBootstrapSecretMock.mockReturnValue(false)

    const response = await POST(
      new NextRequest(
        "https://paulrdrs.com/dashboard/passkeys/registration/options",
        {
          body: JSON.stringify({
            bootstrapSecret: "wrong",
            email: "admin@example.com"
          }),
          method: "POST"
        }
      )
    )

    expect(response.status).toBe(403)
  })
})
