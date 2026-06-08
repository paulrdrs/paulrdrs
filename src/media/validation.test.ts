import {
  isAllowedMediaMimeType,
  MAX_MEDIA_FILE_SIZE_BYTES,
  validateMediaFile
} from "./validation"

const createFile = ({ size, type }: { size?: number; type: string }) => {
  const bytes = new Uint8Array(size ?? 4)
  return new File([bytes], "asset.png", { type })
}

describe("media validation", () => {
  it("allows supported image mime types", () => {
    expect(isAllowedMediaMimeType("image/png")).toBe(true)
    expect(isAllowedMediaMimeType("image/webp")).toBe(true)
  })

  it("rejects unsupported mime types", () => {
    expect(() =>
      validateMediaFile(createFile({ type: "application/pdf" }))
    ).toThrow("Unsupported file type")
  })

  it("rejects empty files", () => {
    expect(() =>
      validateMediaFile(createFile({ size: 0, type: "image/png" }))
    ).toThrow("File is required")
  })

  it("rejects files over the size limit", () => {
    expect(() =>
      validateMediaFile(
        createFile({
          size: MAX_MEDIA_FILE_SIZE_BYTES + 1,
          type: "image/png"
        })
      )
    ).toThrow("File is too large")
  })
})
