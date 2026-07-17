import { NextRequest } from "next/server"
import { getDashboardMediaAsset } from "@/db/adminContent"
import { getMediaObject } from "@/media/storage"
import { GET } from "./route"

vi.mock("@/db/adminContent", () => ({
  getDashboardMediaAsset: vi.fn()
}))

vi.mock("@/media/storage", () => ({
  getMediaObject: vi.fn()
}))

const getDashboardMediaAssetMock = vi.mocked(getDashboardMediaAsset)
const getMediaObjectMock = vi.mocked(getMediaObject)
const createBodyStream = (value: string) =>
  new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(value))
      controller.close()
    }
  })

describe("media proxy route", () => {
  it("returns stored media objects", async () => {
    getDashboardMediaAssetMock.mockResolvedValue({
      altText: "A photo",
      attribution: null,
      createdAt: new Date("2026-01-01"),
      filename: "photo.png",
      height: null,
      id: "asset-id",
      metadata: {},
      mimeType: "image/png",
      objectKey: "media/photo.png",
      sourceKey: null,
      sizeBytes: 5,
      updatedAt: new Date("2026-01-01"),
      width: null
    })
    getMediaObjectMock.mockResolvedValue({
      body: createBodyStream("hello"),
      httpMetadata: { contentType: "image/png" }
    } as unknown as Awaited<ReturnType<typeof getMediaObject>>)

    const response = await GET(
      new NextRequest("https://paulrdrs.com/media/asset-id"),
      { params: Promise.resolve({ id: "asset-id" }) }
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toBe("image/png")
    expect(await response.text()).toBe("hello")
  })

  it("returns 404 for missing metadata", async () => {
    getDashboardMediaAssetMock.mockResolvedValue(undefined)

    const response = await GET(
      new NextRequest("https://paulrdrs.com/media/missing"),
      { params: Promise.resolve({ id: "missing" }) }
    )

    expect(response.status).toBe(404)
  })
})
