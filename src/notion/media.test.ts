vi.mock("server-only", () => ({}))

import { getDb } from "@/db/client"
import { uploadMediaObject } from "@/media/storage"
import { buildMediaObjectKey } from "@/media/upload"
import { validateMediaFile } from "@/media/validation"
import { getNotionImageSourceKey, rehostImage } from "./media"

vi.mock("@/db/client", () => ({ getDb: vi.fn() }))
vi.mock("@/media/storage", () => ({ uploadMediaObject: vi.fn() }))
vi.mock("@/media/upload", () => ({ buildMediaObjectKey: vi.fn() }))
vi.mock("@/media/validation", () => ({ validateMediaFile: vi.fn() }))

const getDbMock = vi.mocked(getDb)
const uploadMediaObjectMock = vi.mocked(uploadMediaObject)
const buildMediaObjectKeyMock = vi.mocked(buildMediaObjectKey)
const validateMediaFileMock = vi.mocked(validateMediaFile)

const mockSelectExisting = (existing: { id: string }[]) => {
  const limit = vi.fn().mockResolvedValue(existing)
  const where = vi.fn(() => ({ limit }))
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))
  return select
}

const mockInsertReturning = (asset: { id: string }) => {
  const returning = vi.fn().mockResolvedValue([asset])
  const values = vi.fn(() => ({ returning }))
  const insert = vi.fn(() => ({ values }))
  return insert
}

describe("getNotionImageSourceKey", () => {
  it("strips the signed query string from an uploaded file URL", () => {
    const a = getNotionImageSourceKey({
      type: "file",
      url: "https://s3.example.com/object/path.png?X-Amz-Signature=one"
    })
    const b = getNotionImageSourceKey({
      type: "file",
      url: "https://s3.example.com/object/path.png?X-Amz-Signature=two"
    })

    expect(a).toBe(b)
  })

  it("hashes the full URL for an external image", () => {
    const a = getNotionImageSourceKey({
      type: "external",
      url: "https://example.com/a.png"
    })
    const b = getNotionImageSourceKey({
      type: "external",
      url: "https://example.com/b.png"
    })

    expect(a).not.toBe(b)
  })
})

describe("rehostImage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("returns the existing media id without downloading when sourceKey already exists", async () => {
    const select = mockSelectExisting([{ id: "existing-id" }])
    getDbMock.mockReturnValue({ select } as unknown as ReturnType<typeof getDb>)

    const id = await rehostImage("https://example.com/image.png", "source-key")

    expect(id).toBe("existing-id")
    expect(global.fetch).not.toHaveBeenCalled()
    expect(uploadMediaObjectMock).not.toHaveBeenCalled()
  })

  it("downloads, validates, uploads, and inserts a new asset", async () => {
    const select = mockSelectExisting([])
    const insert = mockInsertReturning({ id: "new-id" })
    getDbMock.mockReturnValue({
      insert,
      select
    } as unknown as ReturnType<typeof getDb>)

    const bytes = new Uint8Array([1, 2, 3])
    global.fetch = vi.fn().mockResolvedValue(
      new Response(bytes, {
        headers: { "content-type": "image/png" },
        status: 200
      })
    )
    buildMediaObjectKeyMock.mockReturnValue("media/2024-01-01/object-key.png")

    const id = await rehostImage("https://example.com/image.png", "source-key")

    expect(id).toBe("new-id")
    expect(validateMediaFileMock).toHaveBeenCalledTimes(1)
    expect(uploadMediaObjectMock).toHaveBeenCalledWith({
      body: expect.any(Uint8Array),
      contentType: "image/png",
      objectKey: "media/2024-01-01/object-key.png"
    })
    expect(insert).toHaveBeenCalledTimes(1)
  })

  it("throws when the download fails", async () => {
    const select = mockSelectExisting([])
    getDbMock.mockReturnValue({ select } as unknown as ReturnType<typeof getDb>)
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 404 }))

    await expect(
      rehostImage("https://example.com/missing.png", "source-key")
    ).rejects.toThrow(/Failed to download Notion image/)
  })
})
