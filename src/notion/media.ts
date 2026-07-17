import "server-only"
import { createHash } from "node:crypto"
import { eq } from "drizzle-orm"
import { getDb } from "@/db/client"
import { mediaAssets } from "@/db/schema"
import { uploadMediaObject } from "@/media/storage"
import { buildMediaObjectKey } from "@/media/upload"
import { validateMediaFile } from "@/media/validation"
import type { NotionImageSource } from "./types"

// Uploaded Notion files are served via short-lived presigned URLs that get
// re-signed on every fetch, so the query string can't be part of the key.
// External URLs are stable, so the full URL is the key.
export const getNotionImageSourceKey = (source: NotionImageSource) => {
  const stableUrl =
    source.type === "file" ? source.url.split("?")[0] : source.url
  return createHash("sha256").update(stableUrl).digest("hex")
}

const getFilenameFromUrl = (url: string) => {
  const segment = new URL(url).pathname.split("/").pop()
  return segment || "image"
}

export const rehostImage = async (url: string, sourceKey: string) => {
  const db = getDb()

  const [existing] = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(eq(mediaAssets.sourceKey, sourceKey))
    .limit(1)

  if (existing) {
    return existing.id
  }

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download Notion image (${response.status})`)
  }

  const filename = getFilenameFromUrl(url)
  const contentType =
    response.headers.get("content-type")?.split(";")[0]?.trim() ||
    "application/octet-stream"
  const body = new Uint8Array(await response.arrayBuffer())
  const file = new File([body], filename, { type: contentType })

  validateMediaFile(file)

  const objectKey = buildMediaObjectKey(filename)

  await uploadMediaObject({ body, contentType, objectKey })

  const [asset] = await db
    .insert(mediaAssets)
    .values({
      filename,
      mimeType: contentType,
      objectKey,
      sizeBytes: body.byteLength,
      sourceKey
    })
    .returning({ id: mediaAssets.id })

  return asset.id
}
