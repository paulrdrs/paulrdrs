import "server-only"
import { getCloudflareContext } from "@opennextjs/cloudflare"

// Media lives in an R2 bucket bound as `BUCKET` on the Cloudflare context.
const getBucket = () => getCloudflareContext().env.BUCKET

export const uploadMediaObject = async ({
  body,
  contentType,
  objectKey
}: {
  body: Uint8Array
  contentType: string
  objectKey: string
}) => {
  await getBucket().put(objectKey, body, {
    httpMetadata: { contentType }
  })
}

export const getMediaObject = async (objectKey: string) => {
  return getBucket().get(objectKey)
}
