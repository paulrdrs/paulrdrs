import { sendMagicLinkEmail } from "./email"
import { createMagicLinkUrl, requestMagicLink } from "./magicLink"
import { createMagicLinkToken } from "./tokens"

vi.mock("./tokens", () => ({
  createMagicLinkToken: vi.fn(),
  isAllowedAdminEmail: (email: string, allowlist: string[]) =>
    allowlist.includes(email.trim().toLowerCase()),
  normalizeEmail: (email: string) => email.trim().toLowerCase()
}))

vi.mock("./email", () => ({
  sendMagicLinkEmail: vi.fn()
}))

const createMagicLinkTokenMock = vi.mocked(createMagicLinkToken)
const sendMagicLinkEmailMock = vi.mocked(sendMagicLinkEmail)

describe("magic-link requests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates a token and sends an email for allowed maintainers", async () => {
    createMagicLinkTokenMock.mockResolvedValue("raw-token")

    await requestMagicLink({
      allowlist: ["admin@example.com"],
      email: " Admin@Example.com ",
      resendApiKey: "re_test_key",
      resendFromEmail: "Paulo <admin@example.com>",
      siteUrl: "https://paulrdrs.com"
    })

    expect(createMagicLinkTokenMock).toHaveBeenCalledWith("admin@example.com")
    expect(sendMagicLinkEmailMock).toHaveBeenCalledWith({
      apiKey: "re_test_key",
      from: "Paulo <admin@example.com>",
      loginUrl: "https://paulrdrs.com/dashboard/auth/callback?token=raw-token",
      to: "admin@example.com"
    })
  })

  it("does not create a token or reveal disallowed emails", async () => {
    await requestMagicLink({
      allowlist: ["admin@example.com"],
      email: "reader@example.com",
      resendApiKey: "re_test_key",
      resendFromEmail: "Paulo <admin@example.com>",
      siteUrl: "https://paulrdrs.com"
    })

    expect(createMagicLinkTokenMock).not.toHaveBeenCalled()
    expect(sendMagicLinkEmailMock).not.toHaveBeenCalled()
  })

  it("builds callback URLs from the configured site URL", () => {
    expect(createMagicLinkUrl("https://paulrdrs.com", "abc123")).toBe(
      "https://paulrdrs.com/dashboard/auth/callback?token=abc123"
    )
  })
})
