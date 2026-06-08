vi.mock("server-only", () => ({}))

import { getSessionCookieOptions } from "./session"

describe("session cookies", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("uses secure cookies in production", () => {
    vi.stubEnv("NODE_ENV", "production")

    expect(getSessionCookieOptions()).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true
    })
  })

  it("allows non-secure cookies outside production", () => {
    vi.stubEnv("NODE_ENV", "development")

    expect(getSessionCookieOptions()).toMatchObject({
      secure: false
    })
  })
})
