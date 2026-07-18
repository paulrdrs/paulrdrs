import { Client } from "@notionhq/client"
import { createNotionSyncRuntime } from "./runtime"

const database = {} as D1Database
const bucket = {} as R2Bucket

const validEnvironment = {
  BUCKET: bucket,
  DB: database,
  NOTION_PAGES_DB_ID: "pages-db",
  NOTION_PHOTOS_DB_ID: "photos-db",
  NOTION_POSTS_DB_ID: "posts-db",
  NOTION_PROJECTS_DB_ID: "projects-db",
  NOTION_TOKEN: "notion-token"
}

describe("createNotionSyncRuntime", () => {
  it("constructs direct D1, R2, Notion, and database-id dependencies", () => {
    const runtime = createNotionSyncRuntime(validEnvironment)

    expect(runtime.bucket).toBe(bucket)
    expect(runtime.db.$client).toBe(database)
    expect(runtime.notion).toBeInstanceOf(Client)
    expect(runtime.databaseIds).toEqual({
      pages: "pages-db",
      photos: "photos-db",
      posts: "posts-db",
      projects: "projects-db"
    })
  })

  it.each([
    "NOTION_TOKEN",
    "NOTION_POSTS_DB_ID",
    "NOTION_PROJECTS_DB_ID",
    "NOTION_PHOTOS_DB_ID",
    "NOTION_PAGES_DB_ID"
  ] as const)("rejects a missing or empty %s", (name) => {
    expect(() =>
      createNotionSyncRuntime({ ...validEnvironment, [name]: "" })
    ).toThrow()
  })

  it("rejects missing Worker bindings", () => {
    expect(() =>
      createNotionSyncRuntime({
        ...validEnvironment,
        BUCKET: undefined as unknown as R2Bucket
      })
    ).toThrow()
    expect(() =>
      createNotionSyncRuntime({
        ...validEnvironment,
        DB: undefined as unknown as D1Database
      })
    ).toThrow()
  })
})
