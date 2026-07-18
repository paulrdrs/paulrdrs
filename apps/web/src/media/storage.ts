import "server-only"
import { getCloudflareContext } from "@opennextjs/cloudflare"

// Public app access to media is read-only. Uploads are owned by the sync Worker.
const getBucket = () => getCloudflareContext().env.BUCKET

export const getMediaObject = async (objectKey: string) => {
  return getBucket().get(objectKey)
}
