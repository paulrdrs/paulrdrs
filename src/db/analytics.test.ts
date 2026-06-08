vi.mock("server-only", () => ({}))

import { getDashboardAnalyticsSummary } from "./analytics"
import { getDb } from "./client"

vi.mock("./client", () => ({
  getDb: vi.fn()
}))

const getDbMock = vi.mocked(getDb)

describe("dashboard analytics queries", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns aggregate analytics summaries", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([{ recentViews: 12, recentVisitors: 4 }])
      .mockResolvedValueOnce([
        { path: "/blog/hello", views: 7 },
        { path: "/", views: 5 }
      ])
      .mockResolvedValueOnce([
        {
          contentId: "post-id",
          slug: "hello",
          title: "Hello Post",
          views: 7
        }
      ])
      .mockResolvedValueOnce([
        {
          category: "photography",
          contentId: "project-id",
          slug: "camera-work",
          title: "Camera Work",
          views: 3
        }
      ])
      .mockResolvedValueOnce([
        { date: "2026-06-07", views: 5 },
        { date: "2026-06-08", views: 7 }
      ])

    getDbMock.mockReturnValue({ execute } as unknown as ReturnType<
      typeof getDb
    >)

    await expect(getDashboardAnalyticsSummary()).resolves.toEqual({
      dailyViews: [
        { date: "2026-06-07", views: 5 },
        { date: "2026-06-08", views: 7 }
      ],
      recentViews: 12,
      recentVisitors: 4,
      topPaths: [
        { path: "/blog/hello", views: 7 },
        { path: "/", views: 5 }
      ],
      topPosts: [
        {
          contentId: "post-id",
          slug: "hello",
          title: "Hello Post",
          views: 7
        }
      ],
      topProjects: [
        {
          category: "photography",
          contentId: "project-id",
          slug: "camera-work",
          title: "Camera Work",
          views: 3
        }
      ]
    })
    expect(execute).toHaveBeenCalledTimes(5)
  })

  it("returns empty analytics state gracefully", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    getDbMock.mockReturnValue({ execute } as unknown as ReturnType<
      typeof getDb
    >)

    await expect(getDashboardAnalyticsSummary()).resolves.toEqual({
      dailyViews: [],
      recentViews: 0,
      recentVisitors: 0,
      topPaths: [],
      topPosts: [],
      topProjects: []
    })
  })
})
