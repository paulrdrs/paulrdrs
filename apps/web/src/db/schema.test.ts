import { getTableName } from "drizzle-orm"
import {
  contentStatusValues,
  mediaAssets,
  pages,
  photoProjects,
  photos,
  posts,
  projectCategoryValues,
  projects,
  siteNavigationSettings
} from "./schema"

describe("database schema", () => {
  it("defines content status values", () => {
    expect(contentStatusValues).toEqual(["draft", "published"])
  })

  it("defines project category values", () => {
    expect(projectCategoryValues).toEqual(["photography", "software"])
  })

  it("defines the planned CMS tables", () => {
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
