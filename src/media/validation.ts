export const MAX_MEDIA_FILE_SIZE_BYTES = 5 * 1024 * 1024

export const allowedMediaMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml"
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
