vi.mock("server-only", () => ({}))

import { getDb } from "./client"
import {
  getSiteNavigationSettings,
  upsertSiteNavigationSettings
} from "./siteSettings"

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
      projectsEnabled: true,
      softwareEnabled: true,
      storeEnabled: true
    })
  })

  it("upserts the singleton navigation settings row", async () => {
    const returning = vi.fn().mockResolvedValue([{ id: "main" }])
    const onConflictDoUpdate = vi.fn(() => ({ returning }))
    const values = vi.fn(() => ({ onConflictDoUpdate }))
    const insert = vi.fn(() => ({ values }))

    getDbMock.mockReturnValue({ insert } as unknown as ReturnType<typeof getDb>)

    const settings = {
      blogEnabled: true,
      photographyEnabled: false,
      projectsEnabled: true,
      softwareEnabled: false,
      storeEnabled: true
    }

    await expect(upsertSiteNavigationSettings(settings)).resolves.toEqual({
      id: "main"
    })
    expect(values).toHaveBeenCalledWith({ ...settings, id: "main" })
    expect(onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        set: expect.objectContaining(settings)
      })
    )
  })
})
