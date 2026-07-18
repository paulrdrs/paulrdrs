import { getNotionImageSourceKey, rehostImage } from "./media"
import type { NotionSyncRuntime } from "./runtime"
import { MAX_MEDIA_FILE_SIZE_BYTES } from "./validation"

const bucketPut = vi.fn().mockResolvedValue(undefined)
const runtime = {
  bucket: { put: bucketPut },
  databaseIds: {},
  notion: {}
} as unknown as NotionSyncRuntime

const setDatabase = (db: object) => Object.assign(runtime, { db })

const buildSelectChain = (existing: { id: string }[]) => {
  const limit = vi.fn().mockResolvedValue(existing)
  const where = vi.fn(() => ({ limit }))
  const from = vi.fn(() => ({ where }))
  return { from }
}

const mockSelectExisting = (existing: { id: string }[]) =>
  vi.fn(() => buildSelectChain(existing))

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
    globalThis.fetch = vi.fn()
  })

  it("returns the existing media id without downloading when sourceKey already exists", async () => {
    const select = mockSelectExisting([{ id: "existing-id" }])
    setDatabase({ select })

    const id = await rehostImage(
      runtime,
      "https://example.com/image.png",
      "source-key"
    )

    expect(id).toBe("existing-id")
    expect(globalThis.fetch).not.toHaveBeenCalled()
    expect(bucketPut).not.toHaveBeenCalled()
  })

  it("downloads, validates, uploads, and inserts a new asset", async () => {
    const select = mockSelectExisting([])
    const insert = mockInsertReturning({ id: "new-id" })
    setDatabase({ insert, select })

    const bytes = new Uint8Array([1, 2, 3])
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(bytes, {
        headers: { "content-type": "image/png" },
        status: 200
      })
    )
    const id = await rehostImage(
      runtime,
      "https://example.com/image.png",
      "source-key"
    )

    expect(id).toBe("new-id")
    expect(bucketPut).toHaveBeenCalledWith(
      "media/notion/source-key",
      expect.any(Uint8Array),
      { httpMetadata: { contentType: "image/png" } }
    )
    expect(insert).toHaveBeenCalledTimes(1)
  })

  it("uses the asset inserted by another isolate when its insert loses the race", async () => {
    const select = vi
      .fn()
      .mockReturnValueOnce(buildSelectChain([]))
      .mockReturnValueOnce(buildSelectChain([{ id: "concurrent-id" }]))
    const returning = vi.fn().mockRejectedValue(new Error("UNIQUE constraint"))
    const values = vi.fn(() => ({ returning }))
    const insert = vi.fn(() => ({ values }))
    setDatabase({ insert, select })
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        headers: { "content-type": "image/png" },
        status: 200
      })
    )

    await expect(
      rehostImage(runtime, "https://example.com/image.png", "race-source-key")
    ).resolves.toBe("concurrent-id")
    expect(bucketPut).toHaveBeenCalledWith(
      "media/notion/race-source-key",
      expect.any(Uint8Array),
      { httpMetadata: { contentType: "image/png" } }
    )
    expect(select).toHaveBeenCalledTimes(2)
  })

  it("shares an in-flight rehost for the same source key", async () => {
    const select = mockSelectExisting([])
    const insert = mockInsertReturning({ id: "new-id" })
    setDatabase({ insert, select })

    let finishDownload: (response: Response) => void = () => {}
    globalThis.fetch = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finishDownload = resolve
        })
    )

    const first = rehostImage(
      runtime,
      "https://example.com/image.png",
      "shared-source-key"
    )
    const second = rehostImage(
      runtime,
      "https://example.com/image.png",
      "shared-source-key"
    )

    await vi.waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1))
    finishDownload(
      new Response(new Uint8Array([1, 2, 3]), {
        headers: { "content-type": "image/png" },
        status: 200
      })
    )

    await expect(Promise.all([first, second])).resolves.toEqual([
      "new-id",
      "new-id"
    ])
    expect(bucketPut).toHaveBeenCalledTimes(1)
    expect(insert).toHaveBeenCalledTimes(1)
  })

  it("throws when the download fails", async () => {
    const select = mockSelectExisting([])
    setDatabase({ select })
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 404 }))

    await expect(
      rehostImage(runtime, "https://example.com/missing.png", "source-key")
    ).rejects.toThrow(/Failed to download Notion image/)
  })

  it("rejects an oversized declared length before reading the body", async () => {
    const select = mockSelectExisting([])
    setDatabase({ select })
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([1]), {
        headers: {
          "content-length": String(MAX_MEDIA_FILE_SIZE_BYTES + 1),
          "content-type": "image/png"
        },
        status: 200
      })
    )

    await expect(
      rehostImage(runtime, "https://example.com/oversized.png", "source-key")
    ).rejects.toThrow("File is too large")
    expect(bucketPut).not.toHaveBeenCalled()
  })

  it("stops a chunked response when its bytes exceed the limit", async () => {
    const select = mockSelectExisting([])
    setDatabase({ select })
    const cancel = vi.fn()
    const body = new ReadableStream<Uint8Array>({
      cancel,
      start(controller) {
        controller.enqueue(new Uint8Array(MAX_MEDIA_FILE_SIZE_BYTES))
        controller.enqueue(new Uint8Array(1))
      }
    })
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(body, {
        headers: { "content-type": "image/png" },
        status: 200
      })
    )

    await expect(
      rehostImage(runtime, "https://example.com/chunked.png", "source-key")
    ).rejects.toThrow("File is too large")
    expect(cancel).toHaveBeenCalledTimes(1)
    expect(bucketPut).not.toHaveBeenCalled()
  })
})
