import { randomUUID } from "node:crypto"
import { validateMediaFile } from "./validation"

const getExtension = (filename: string) => {
  const extension = filename.split(".").pop()
  return extension ? `.${extension.toLowerCase()}` : ""
}

export const buildMediaObjectKey = (filename: string) => {
  return `media/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${getExtension(filename)}`
}

export const parseMediaUploadForm = (formData: FormData) => {
  const file = formData.get("file")

  if (!(file instanceof File)) {
    throw new Error("File is required")
  }

  validateMediaFile(file)

  return {
    altText: String(formData.get("altText") ?? "").trim() || null,
    attribution: String(formData.get("attribution") ?? "").trim() || null,
    file
  }
}
