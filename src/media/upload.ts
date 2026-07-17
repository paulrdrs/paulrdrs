import { randomUUID } from "node:crypto"

const getExtension = (filename: string) => {
  const extension = filename.split(".").pop()
  return extension ? `.${extension.toLowerCase()}` : ""
}

export const buildMediaObjectKey = (filename: string) => {
  return `media/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${getExtension(filename)}`
}
