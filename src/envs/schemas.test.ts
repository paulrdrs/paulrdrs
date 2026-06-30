import {
  analyticsEnvsSchema,
  notionEnvsSchema,
  serverEnvsSchema,
  storageEnvsSchema
} from "./schemas"

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

describe("notionEnvsSchema", () => {
  const valid = {
    JOBS_SECRET: "a-secret-that-is-at-least-32-chars",
    NOTION_PAGES_DB_ID: "pages-db-id",
    NOTION_POSTS_DB_ID: "posts-db-id",
    NOTION_PROJECTS_DB_ID: "projects-db-id",
    NOTION_TOKEN: "secret_notion-token"
  }

  it("parses valid input", () => {
    expect(notionEnvsSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects a missing NOTION_TOKEN", () => {
    const { NOTION_TOKEN: _, ...rest } = valid
    expect(notionEnvsSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects a short JOBS_SECRET", () => {
    expect(
      notionEnvsSchema.safeParse({ ...valid, JOBS_SECRET: "too-short" }).success
    ).toBe(false)
  })
})
