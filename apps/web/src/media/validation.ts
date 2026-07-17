export const MAX_MEDIA_FILE_SIZE_BYTES = 5 * 1024 * 1024

// SVG is intentionally excluded: it can embed scripts, and media is served
// from the site's own origin via /media/[id], which would make a malicious SVG
// a stored-XSS vector.
export const allowedMediaMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
] as const

export const isAllowedMediaMimeType = (mimeType: string) => {
  return allowedMediaMimeTypes.includes(
    mimeType as (typeof allowedMediaMimeTypes)[number]
  )
}

export const validateMediaFile = (file: File) => {
  if (file.size <= 0) {
    throw new Error("File is required")
  }

  if (file.size > MAX_MEDIA_FILE_SIZE_BYTES) {
    throw new Error("File is too large")
  }

  if (!isAllowedMediaMimeType(file.type)) {
    throw new Error("Unsupported file type")
  }
}
