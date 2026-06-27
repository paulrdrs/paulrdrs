import {
  analyticsEnvsSchema,
  authEnvsSchema,
  clientEnvsSchema,
  serverEnvsSchema,
  storageEnvsSchema
} from "./schemas"

describe("clientEnvsSchema", () => {
  const valid = {
    AUTH_COOKIE_PREFIX: "auth.",
    AUTH_SELECTED_ACCOUNT_COOKIE_NAME: "selected-account"
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
})

describe("serverEnvsSchema", () => {
  const valid = {
    NODE_ENV: "development" as const,
    DATABASE_URL: "postgres://user:password@localhost:5432/paulrdrs"
  }

  it("parses valid input", () => {
    expect(serverEnvsSchema.safeParse(valid).success).toBe(true)
  })

  it("accepts production NODE_ENV", () => {
    expect(
      serverEnvsSchema.safeParse({ ...valid, NODE_ENV: "production" }).success
    ).toBe(true)
  })

  it("accepts test NODE_ENV", () => {
    expect(
      serverEnvsSchema.safeParse({ ...valid, NODE_ENV: "test" }).success
    ).toBe(true)
  })

  it("rejects an unknown NODE_ENV", () => {
    expect(
      serverEnvsSchema.safeParse({ ...valid, NODE_ENV: "staging" }).success
    ).toBe(false)
  })

  it("rejects missing DATABASE_URL", () => {
    const { DATABASE_URL: _, ...rest } = valid
    expect(serverEnvsSchema.safeParse(rest).success).toBe(false)
  })
})

describe("authEnvsSchema", () => {
  const valid = {
    ADMIN_EMAIL_ALLOWLIST: "admin@example.com, editor@example.com",
    PASSKEY_BOOTSTRAP_SECRET: "a-bootstrap-secret-at-least-32-chars",
    SESSION_SECRET: "a-secret-that-is-at-least-32-chars",
    SITE_URL: "https://paulrdrs.com"
  }

  it("parses valid input", () => {
    const result = authEnvsSchema.safeParse(valid)

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.ADMIN_EMAIL_ALLOWLIST).toEqual([
        "admin@example.com",
        "editor@example.com"
      ])
    }
  })

  it("rejects an invalid maintainer allowlist email", () => {
    expect(
      authEnvsSchema.safeParse({
        ...valid,
        ADMIN_EMAIL_ALLOWLIST: "admin@example.com, not-an-email"
      }).success
    ).toBe(false)
  })

  it("rejects a short SESSION_SECRET", () => {
    expect(
      authEnvsSchema.safeParse({ ...valid, SESSION_SECRET: "too-short" })
        .success
    ).toBe(false)
  })

  it("rejects a short PASSKEY_BOOTSTRAP_SECRET", () => {
    expect(
      authEnvsSchema.safeParse({
        ...valid,
        PASSKEY_BOOTSTRAP_SECRET: "too-short"
      }).success
    ).toBe(false)
  })

  it("accepts an optional passkey RP ID", () => {
    expect(
      authEnvsSchema.safeParse({ ...valid, PASSKEY_RP_ID: "paulrdrs.com" })
        .success
    ).toBe(true)
  })
})

describe("analyticsEnvsSchema", () => {
  it("parses a sufficiently long salt", () => {
    expect(
      analyticsEnvsSchema.safeParse({
        ANALYTICS_SALT: "a-salt-that-is-at-least-32-chars-long"
      }).success
    ).toBe(true)
  })

  it("rejects a short salt", () => {
    expect(
      analyticsEnvsSchema.safeParse({ ANALYTICS_SALT: "too-short" }).success
    ).toBe(false)
  })
})

describe("storageEnvsSchema", () => {
  const valid = {
    STORAGE_ACCESS_KEY_ID: "access-key-id",
    STORAGE_BUCKET: "media",
    STORAGE_ENDPOINT: "https://storage.railway.app",
    STORAGE_REGION: "auto",
    STORAGE_SECRET_ACCESS_KEY: "secret-access-key"
  }

  it("parses valid input", () => {
    expect(storageEnvsSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects a non-URL endpoint", () => {
    expect(
      storageEnvsSchema.safeParse({
        ...valid,
        STORAGE_ENDPOINT: "not-a-url"
      }).success
    ).toBe(false)
  })
})
