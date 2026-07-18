import "server-only"
import { createHash } from "node:crypto"
import { mediaAssets } from "@paulrdrs/database/schema"
import { eq } from "drizzle-orm"
import { getDb } from "@/db/client"
import { uploadMediaObject } from "@/media/storage"
import { buildMediaObjectKey } from "@/media/upload"
import {
  isAllowedMediaMimeType,
  MAX_MEDIA_FILE_SIZE_BYTES,
  validateMediaFile
} from "@/media/validation"
import type { NotionImageSource } from "./imageSource"

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

const getContentType = (response: Response) =>
  response.headers.get("content-type")?.split(";")[0]?.trim() ||
  "application/octet-stream"

const getDeclaredContentLength = (response: Response) => {
  const header = response.headers.get("content-length")

  if (!header) {
    return null
  }

  const length = Number(header)
  return Number.isSafeInteger(length) && length >= 0 ? length : null
}

const readMediaBody = async (response: Response) => {
  const declaredLength = getDeclaredContentLength(response)

  if (declaredLength !== null && declaredLength > MAX_MEDIA_FILE_SIZE_BYTES) {
    throw new Error("File is too large")
  }

  if (!response.body) {
    return new Uint8Array()
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      totalBytes += value.byteLength

      if (totalBytes > MAX_MEDIA_FILE_SIZE_BYTES) {
        throw new Error("File is too large")
      }

      chunks.push(value)
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined)
    throw error
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0

  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  return body
}

const inFlightRehosts = new Map<string, Promise<string>>()

const rehostImageOnce = async (url: string, sourceKey: string) => {
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
  const contentType = getContentType(response)

  if (!isAllowedMediaMimeType(contentType)) {
    throw new Error("Unsupported file type")
  }

  const body = await readMediaBody(response)
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

export const rehostImage = (url: string, sourceKey: string) => {
  const inFlight = inFlightRehosts.get(sourceKey)

  if (inFlight) {
    return inFlight
  }

  const operation = rehostImageOnce(url, sourceKey).finally(() => {
    inFlightRehosts.delete(sourceKey)
  })

  inFlightRehosts.set(sourceKey, operation)
  return operation
}
