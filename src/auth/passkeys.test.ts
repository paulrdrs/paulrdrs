vi.mock("server-only", () => ({}))

import { getDb } from "@/db/client"
import { getAuthEnvs } from "@/envs/server"
import {
  assertAllowedAdminEmail,
  deleteExpiredChallenges,
  getPasskeyConfig,
  verifyBootstrapSecret
} from "./passkeys"

vi.mock("@/envs/server", () => ({
  getAuthEnvs: vi.fn()
}))

vi.mock("@/db/client", () => ({
  getDb: vi.fn()
}))

const getAuthEnvsMock = vi.mocked(getAuthEnvs)
const getDbMock = vi.mocked(getDb)

describe("passkey auth config", () => {
  beforeEach(() => {
    getAuthEnvsMock.mockReturnValue({
      ADMIN_EMAIL_ALLOWLIST: ["admin@example.com"],
      PASSKEY_BOOTSTRAP_SECRET: "a-bootstrap-secret-at-least-32-chars",
      SESSION_SECRET: "a-secret-that-is-at-least-32-chars",
      SITE_URL: "https://www.paulrdrs.com"
    })
  })

  it("derives the RP ID from SITE_URL", () => {
    expect(getPasskeyConfig()).toMatchObject({
      expectedOrigin: "https://www.paulrdrs.com",
      rpID: "paulrdrs.com"
    })
  })

  it("uses an explicit RP ID when configured", () => {
    getAuthEnvsMock.mockReturnValue({
      ADMIN_EMAIL_ALLOWLIST: ["admin@example.com"],
      PASSKEY_BOOTSTRAP_SECRET: "a-bootstrap-secret-at-least-32-chars",
      PASSKEY_RP_ID: "admin.paulrdrs.com",
      SESSION_SECRET: "a-secret-that-is-at-least-32-chars",
      SITE_URL: "https://admin.paulrdrs.com"
    })

    expect(getPasskeyConfig().rpID).toBe("admin.paulrdrs.com")
  })

  it("verifies bootstrap secrets", () => {
    expect(verifyBootstrapSecret("a-bootstrap-secret-at-least-32-chars")).toBe(
      true
    )
    expect(verifyBootstrapSecret("wrong")).toBe(false)
  })

  it("normalizes allowed admin emails", () => {
    expect(assertAllowedAdminEmail(" Admin@Example.com ")).toBe(
      "admin@example.com"
    )
    expect(() => assertAllowedAdminEmail("reader@example.com")).toThrow(
      "Email is not allowed"
    )
  })
})

describe("deleteExpiredChallenges", () => {
  it("deletes expired or consumed challenges", async () => {
    const where = vi.fn().mockResolvedValue(undefined)
    const deleteFn = vi.fn(() => ({ where }))

    getDbMock.mockReturnValue({
      delete: deleteFn
    } as unknown as ReturnType<typeof getDb>)

    await deleteExpiredChallenges()

    expect(deleteFn).toHaveBeenCalledTimes(1)
    expect(where).toHaveBeenCalledTimes(1)
  })
})
