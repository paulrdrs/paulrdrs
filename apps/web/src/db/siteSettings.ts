import { siteNavigationSettings } from "@paulrdrs/database/schema"
import { eq } from "drizzle-orm"
import { unstable_cache } from "next/cache"
import {
  defaultSiteNavigationSettings,
  type SiteNavigationSettings
} from "@/site/navigation"
import { getDb } from "./client"

const siteNavigationSettingsId = "main"

const getCachedSiteNavigationSettings = unstable_cache(
  async () => {
    const [settings] = await getDb()
      .select({
        blogEnabled: siteNavigationSettings.blogEnabled,
        photographyEnabled: siteNavigationSettings.photographyEnabled,
        softwareEnabled: siteNavigationSettings.softwareEnabled,
        storeEnabled: siteNavigationSettings.storeEnabled
      })
      .from(siteNavigationSettings)
      .where(eq(siteNavigationSettings.id, siteNavigationSettingsId))
      .limit(1)

    return settings ?? { ...defaultSiteNavigationSettings }
  },
  ["site-navigation-settings"],
  { revalidate: 300 }
)

export const getSiteNavigationSettings =
  async (): Promise<SiteNavigationSettings> => {
    try {
      return await getCachedSiteNavigationSettings()
    } catch {
      // Navigation visibility is non-critical; fall back to defaults when the
      // settings can't be read (e.g. a static build with no DB connection).
      return { ...defaultSiteNavigationSettings }
    }
  }
