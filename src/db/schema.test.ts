import { getTableName } from "drizzle-orm"
import {
  adminPasskeys,
  analyticsContentType,
  analyticsEvents,
  authSessions,
  contentStatus,
  magicLinkTokens,
  mediaAssets,
  pages,
  posts,
  projectCategory,
  projects,
  siteNavigationSettings,
  webauthnChallenges
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
      getTableName(analyticsEvents),
      getTableName(magicLinkTokens),
      getTableName(adminPasskeys),
      getTableName(webauthnChallenges),
      getTableName(authSessions)
    ]).toEqual([
      "posts",
      "projects",
      "pages",
      "site_navigation_settings",
      "media_assets",
      "analytics_events",
      "magic_link_tokens",
      "admin_passkeys",
      "webauthn_challenges",
      "auth_sessions"
    ])
  })
})
