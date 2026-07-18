vi.mock("server-only", () => ({}))
vi.mock("./client", () => ({ getDb: vi.fn() }))

import { mediaAssets } from "@paulrdrs/database/schema"
import { getDb } from "./client"
import { getMediaAssetLocation } from "./media"

const getDbMock = vi.mocked(getDb)

describe("media queries", () => {
  it("selects only the fields needed to locate a public media object", async () => {
    const limit = vi
      .fn()
      .mockResolvedValue([
        { mimeType: "image/png", objectKey: "media/photo.png" }
      ])
    const where = vi.fn(() => ({ limit }))
    const from = vi.fn(() => ({ where }))
    const select = vi.fn(() => ({ from }))

    getDbMock.mockReturnValue({ select } as unknown as ReturnType<typeof getDb>)

    await expect(getMediaAssetLocation("asset-id")).resolves.toEqual({
      mimeType: "image/png",
      objectKey: "media/photo.png"
    })
    expect(select).toHaveBeenCalledWith({
      mimeType: mediaAssets.mimeType,
      objectKey: mediaAssets.objectKey
    })
  })
})
