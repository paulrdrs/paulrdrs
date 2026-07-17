import { mediaAssets } from "@paulrdrs/database/schema"
import { eq } from "drizzle-orm"
import { getDb } from "./client"

type MediaAssetLocation = {
  readonly mimeType: string
  readonly objectKey: string
}

export const getMediaAssetLocation = async (
  id: string
): Promise<MediaAssetLocation | undefined> => {
  const [asset] = await getDb()
    .select({
      mimeType: mediaAssets.mimeType,
      objectKey: mediaAssets.objectKey
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1)

  return asset
}
