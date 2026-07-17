import { eq } from "drizzle-orm"
import { getDb } from "./client"
import { mediaAssets } from "./schema"

export type DashboardMediaAsset = typeof mediaAssets.$inferSelect

export const getDashboardMediaAsset = async (
  id: string
): Promise<DashboardMediaAsset | undefined> => {
  const [asset] = await getDb()
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1)

  return asset
}
