vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({
  unstable_cache: (callback: unknown) => callback
}))

import { getDb } from "./client"
import { getSiteNavigationSettings } from "./siteSettings"

vi.mock("./client", () => ({
  getDb: vi.fn()
}))

const getDbMock = vi.mocked(getDb)

describe("site settings queries", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns all-enabled defaults when no navigation settings row exists", async () => {
    const limit = vi.fn().mockResolvedValue([])
    const where = vi.fn(() => ({ limit }))
    const from = vi.fn(() => ({ where }))
    const select = vi.fn(() => ({ from }))

    getDbMock.mockReturnValue({ select } as unknown as ReturnType<typeof getDb>)

    await expect(getSiteNavigationSettings()).resolves.toEqual({
      blogEnabled: true,
      photographyEnabled: true,
      softwareEnabled: true,
      storeEnabled: true
    })
  })
})
