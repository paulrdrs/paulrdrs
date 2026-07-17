import { getTableName } from "drizzle-orm"
import { describe, expect, it } from "vitest"
import {
  mediaAssets,
  pages,
  photoProjects,
  photos,
  posts,
  projects,
  siteNavigationSettings
} from "./schema"

describe("database schema", () => {
  it("defines the CMS tables", () => {
    expect([
      getTableName(posts),
      getTableName(projects),
      getTableName(photos),
      getTableName(photoProjects),
      getTableName(pages),
      getTableName(siteNavigationSettings),
      getTableName(mediaAssets)
    ]).toEqual([
      "posts",
      "projects",
      "photos",
      "photo_projects",
      "pages",
      "site_navigation_settings",
      "media_assets"
    ])
  })
})
