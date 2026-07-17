import { NextRequest } from "next/server"
import { getMediaAssetLocation } from "@/db/media"
import { getMediaObject } from "@/media/storage"
import { GET } from "./route"

vi.mock("@/db/media", () => ({
  getMediaAssetLocation: vi.fn()
}))

vi.mock("@/media/storage", () => ({
  getMediaObject: vi.fn()
}))

const getMediaAssetLocationMock = vi.mocked(getMediaAssetLocation)
const getMediaObjectMock = vi.mocked(getMediaObject)
const createBody = (value: string) => ({
  transformToWebStream: () =>
    new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(value))
        controller.close()
      }
    })
})

describe("media proxy route", () => {
  it("returns stored media objects", async () => {
    getMediaAssetLocationMock.mockResolvedValue({
      mimeType: "image/png",
      objectKey: "media/photo.png"
    })
    getMediaObjectMock.mockResolvedValue({
      Body: createBody("hello"),
      ContentType: "image/png"
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
    getMediaAssetLocationMock.mockResolvedValue(undefined)

    const response = await GET(
      new NextRequest("https://paulrdrs.com/media/missing"),
      { params: Promise.resolve({ id: "missing" }) }
    )

    expect(response.status).toBe(404)
  })
})
