import { render, screen } from "@testing-library/react"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardAnalyticsSummary } from "@/db/analytics"
import DashboardPage from "./page"

vi.mock("@/auth/guards", () => ({
  requireDashboardSession: vi.fn()
}))

vi.mock("@/db/analytics", () => ({
  getDashboardAnalyticsSummary: vi.fn()
}))

const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const getDashboardAnalyticsSummaryMock = vi.mocked(getDashboardAnalyticsSummary)

describe("DashboardPage", () => {
  beforeEach(() => {
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      id: "session-id"
    })
  })

  it("renders analytics overview metrics", async () => {
    getDashboardAnalyticsSummaryMock.mockResolvedValue({
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

    render(await DashboardPage())

    expect(
      screen.getByRole("heading", { name: "Overview" })
    ).toBeInTheDocument()
    expect(screen.getByText("Views, 30 days")).toBeInTheDocument()
    expect(screen.getByText("Visitors, 30 days")).toBeInTheDocument()
    expect(screen.getByText("Hello Post")).toBeInTheDocument()
    expect(screen.getByText("Camera Work")).toBeInTheDocument()
    expect(screen.getByText("/blog/hello")).toBeInTheDocument()
    expect(screen.getByText("Jun 8, 2026")).toBeInTheDocument()
  })

  it("renders empty analytics state gracefully", async () => {
    getDashboardAnalyticsSummaryMock.mockResolvedValue({
      dailyViews: [],
      recentViews: 0,
      recentVisitors: 0,
      topPaths: [],
      topPosts: [],
      topProjects: []
    })

    render(await DashboardPage())

    expect(screen.getByText("No daily views yet.")).toBeInTheDocument()
    expect(screen.getByText("No post views yet.")).toBeInTheDocument()
    expect(screen.getByText("No project views yet.")).toBeInTheDocument()
    expect(screen.getByText("No path views yet.")).toBeInTheDocument()
  })
})
