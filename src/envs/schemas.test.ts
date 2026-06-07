import { clientEnvsSchema, serverEnvsSchema } from "./schemas"

describe("clientEnvsSchema", () => {
  const valid = {
    AUTH_COOKIE_PREFIX: "auth.",
    AUTH_SELECTED_ACCOUNT_COOKIE_NAME: "selected-account",
    API_URL: "http://localhost:4000"
  }

  it("parses valid input", () => {
    expect(clientEnvsSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects missing AUTH_COOKIE_PREFIX", () => {
    const { AUTH_COOKIE_PREFIX: _, ...rest } = valid
    expect(clientEnvsSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects missing AUTH_SELECTED_ACCOUNT_COOKIE_NAME", () => {
    const { AUTH_SELECTED_ACCOUNT_COOKIE_NAME: _, ...rest } = valid
    expect(clientEnvsSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects a non-URL API_URL", () => {
    expect(
      clientEnvsSchema.safeParse({ ...valid, API_URL: "not-a-url" }).success
    ).toBe(false)
  })
})

describe("serverEnvsSchema", () => {
  const valid = {
    NODE_ENV: "development" as const,
    API_URL: "http://localhost:4000",
    AUTH_SECRET_KEY: "supersecret"
  }

  it("parses valid input", () => {
    expect(serverEnvsSchema.safeParse(valid).success).toBe(true)
  })

  it("accepts production NODE_ENV", () => {
    expect(
      serverEnvsSchema.safeParse({ ...valid, NODE_ENV: "production" }).success
    ).toBe(true)
  })

  it("rejects an unknown NODE_ENV", () => {
    expect(
      serverEnvsSchema.safeParse({ ...valid, NODE_ENV: "test" }).success
    ).toBe(false)
  })

  it("rejects missing AUTH_SECRET_KEY", () => {
    const { AUTH_SECRET_KEY: _, ...rest } = valid
    expect(serverEnvsSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects a non-URL API_URL", () => {
    expect(
      serverEnvsSchema.safeParse({ ...valid, API_URL: "not-a-url" }).success
    ).toBe(false)
  })
})
