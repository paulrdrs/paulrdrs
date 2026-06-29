import { eq } from "drizzle-orm"
import {
  defaultSiteNavigationSettings,
  type SiteNavigationSettings
} from "@/site/navigation"
import { getDb } from "./client"
import { siteNavigationSettings } from "./schema"

const siteNavigationSettingsId = "main"

export const getSiteNavigationSettings =
  async (): Promise<SiteNavigationSettings> => {
    try {
      const [settings] = await getDb()
        .select({
          blogEnabled: siteNavigationSettings.blogEnabled,
          photographyEnabled: siteNavigationSettings.photographyEnabled,
          projectsEnabled: siteNavigationSettings.projectsEnabled,
          softwareEnabled: siteNavigationSettings.softwareEnabled,
          storeEnabled: siteNavigationSettings.storeEnabled
        })
        .from(siteNavigationSettings)
        .where(eq(siteNavigationSettings.id, siteNavigationSettingsId))
        .limit(1)

      return settings ?? { ...defaultSiteNavigationSettings }
    } catch {
      // Navigation visibility is non-critical; fall back to defaults when the
      // settings can't be read (e.g. a static build with no DB connection).
      return { ...defaultSiteNavigationSettings }
    }
  }

export const upsertSiteNavigationSettings = async (
  values: SiteNavigationSettings
) => {
  const [settings] = await getDb()
    .insert(siteNavigationSettings)
    .values({
      ...values,
      id: siteNavigationSettingsId
    })
    .onConflictDoUpdate({
      set: {
        ...values,
        updatedAt: new Date()
      },
      target: siteNavigationSettings.id
    })
    .returning({ id: siteNavigationSettings.id })

  return settings
}
