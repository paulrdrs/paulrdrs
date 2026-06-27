import { render, screen } from "@testing-library/react"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardPosts } from "@/db/adminContent"
import DashboardBlogPostsPage from "./page"

vi.mock("@/auth/guards", () => ({
  requireDashboardSession: vi.fn()
}))

vi.mock("@/db/adminContent", () => ({
  getDashboardPosts: vi.fn()
}))

const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const getDashboardPostsMock = vi.mocked(getDashboardPosts)

describe("DashboardBlogPostsPage", () => {
  beforeEach(() => {
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      lastSeenAt: new Date("2026-01-01"),
      id: "session-id"
    })
  })

  it("renders dashboard posts with edit links", async () => {
    getDashboardPostsMock.mockResolvedValue([
      {
        createdAt: new Date("2026-01-01"),
        id: "post-id",
        publishedAt: new Date("2026-01-02"),
        slug: "hello-post",
        status: "published",
        title: "Hello Post",
        updatedAt: new Date("2026-01-03")
      }
    ])

    render(await DashboardBlogPostsPage())

    expect(screen.getByRole("heading", { name: "Posts" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "New post" })).toHaveAttribute(
      "href",
      "/dashboard/blog/posts/new"
    )
    expect(screen.getByRole("link", { name: "Hello Post" })).toHaveAttribute(
      "href",
      "/dashboard/blog/posts/post-id"
    )
    expect(screen.getByText("published")).toBeInTheDocument()
    expect(screen.getByText("hello-post")).toBeInTheDocument()
  })

  it("renders an empty state", async () => {
    getDashboardPostsMock.mockResolvedValue([])

    render(await DashboardBlogPostsPage())

    expect(screen.getByText("No posts yet.")).toBeInTheDocument()
  })
})
