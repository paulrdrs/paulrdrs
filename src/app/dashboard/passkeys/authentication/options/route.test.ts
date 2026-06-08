import { getPasskeyAuthenticationOptions } from "@/auth/passkeys"
import { POST } from "./route"

vi.mock("@/auth/passkeys", () => ({
  getPasskeyAuthenticationOptions: vi.fn()
}))

const getPasskeyAuthenticationOptionsMock = vi.mocked(
  getPasskeyAuthenticationOptions
)

describe("passkey authentication options route", () => {
  it("returns generated authentication options", async () => {
    getPasskeyAuthenticationOptionsMock.mockResolvedValue({
      challenge: "challenge"
    } as Awaited<ReturnType<typeof getPasskeyAuthenticationOptions>>)

    const response = await POST()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ challenge: "challenge" })
  })
})
