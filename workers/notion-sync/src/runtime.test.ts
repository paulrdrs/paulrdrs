import { describe, expect, it } from "vitest"
import { createNotionSyncRuntime, type NotionSyncEnvironment } from "./runtime"

const environment: NotionSyncEnvironment = {
  BUCKET_ACCESS_KEY_ID: "access-key",
  BUCKET_ENDPOINT: "https://storage.railway.app",
  BUCKET_NAME: "media-bucket",
  BUCKET_SECRET_ACCESS_KEY: "secret-key",
  DATABASE_URL: "postgres://user:password@localhost:5432/paulrdrs",
  NOTION_PAGES_DB_ID: "pages-db",
  NOTION_PHOTOGRAPHY_PROJECTS_DB_ID: "photography-projects-db",
  NOTION_PHOTOS_DB_ID: "photos-db",
  NOTION_POSTS_DB_ID: "posts-db",
  NOTION_SOFTWARE_PROJECTS_DB_ID: "software-projects-db",
  NOTION_TOKEN: "notion-token"
}

describe("createNotionSyncRuntime", () => {
  it("constructs PostgreSQL, bucket, Notion, and database-id dependencies", async () => {
    const runtime = createNotionSyncRuntime(environment)

    expect(runtime.bucketName).toBe("media-bucket")
    expect(runtime.databaseIds).toEqual({
      pages: "pages-db",
      photographyProjects: "photography-projects-db",
      photos: "photos-db",
      posts: "posts-db",
      softwareProjects: "software-projects-db"
    })

    await runtime.close()
    runtime.bucket.destroy()
  })

  it.each([
    "BUCKET_ACCESS_KEY_ID",
    "BUCKET_ENDPOINT",
    "BUCKET_NAME",
    "BUCKET_SECRET_ACCESS_KEY",
    "DATABASE_URL",
    "NOTION_PAGES_DB_ID",
    "NOTION_PHOTOGRAPHY_PROJECTS_DB_ID",
    "NOTION_PHOTOS_DB_ID",
    "NOTION_POSTS_DB_ID",
    "NOTION_SOFTWARE_PROJECTS_DB_ID",
    "NOTION_TOKEN"
  ] as const)("rejects a missing %s value", (name) => {
    expect(() =>
      createNotionSyncRuntime({ ...environment, [name]: "" })
    ).toThrow()
  })
})
