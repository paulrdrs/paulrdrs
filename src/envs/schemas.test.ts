import { notionEnvsSchema } from "./schemas"

describe("notionEnvsSchema", () => {
  const valid = {
    JOBS_SECRET: "a-secret-that-is-at-least-32-chars",
    NOTION_PAGES_DB_ID: "pages-db-id",
    NOTION_PHOTOS_DB_ID: "photos-db-id",
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
