import { getTableName } from "drizzle-orm"
import {
  analyticsContentType,
  analyticsEvents,
  contentStatus,
  mediaAssets,
  pages,
  posts,
  projectCategory,
  projects,
  siteNavigationSettings
} from "./schema"

describe("database schema", () => {
  it("defines content status values", () => {
    expect(contentStatus.enumValues).toEqual(["draft", "published"])
  })

  it("defines project category values", () => {
    expect(projectCategory.enumValues).toEqual(["photography", "software"])
  })

  it("defines analytics content type values", () => {
    expect(analyticsContentType.enumValues).toEqual(["page", "post", "project"])
  })

  it("defines the planned CMS and analytics tables", () => {
    expect([
      getTableName(posts),
      getTableName(projects),
      getTableName(pages),
      getTableName(siteNavigationSettings),
      getTableName(mediaAssets),
      getTableName(analyticsEvents)
    ]).toEqual([
      "posts",
      "projects",
      "pages",
      "site_navigation_settings",
      "media_assets",
      "analytics_events"
    ])
  })
})
