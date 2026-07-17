import { render, screen } from "@testing-library/react"
import { getPublishedPosts } from "@/db/content"
import BlogPage from "./page"

vi.mock("@/db/content", () => ({
  getPublishedPosts: vi.fn()
}))

const getPublishedPostsMock = vi.mocked(getPublishedPosts)

describe("BlogPage", () => {
  it("renders published posts returned by the content query", async () => {
    getPublishedPostsMock.mockResolvedValue([
      {
        id: "post-id",
        title: "Hello Post",
        slug: "hello-post",
        excerpt: "A published post.",
        coverAltText: "A quiet morning desk",
        coverAttribution: null,
        coverMediaId: "post-media-id",
        publishedAt: new Date("2026-01-01"),
        createdAt: new Date("2026-01-01")
      }
    ])

    render(await BlogPage())

    expect(screen.getByRole("heading", { name: "Blog" })).toBeInTheDocument()
    expect(screen.getByRole("list")).toHaveAttribute(
      "data-content-list",
      "blog-posts"
    )
    expect(screen.getByRole("link", { name: "Hello Post" })).toHaveAttribute(
      "href",
      "/blog/hello-post"
    )
    expect(screen.getByText("A published post.")).toBeInTheDocument()
    expect(
      screen
        .getByRole("img", { name: "A quiet morning desk" })
        .getAttribute("src")
    ).toContain("%2Fmedia%2Fpost-media-id")
  })

  it("renders an empty state when no posts are published", async () => {
    getPublishedPostsMock.mockResolvedValue([])

    render(await BlogPage())

    expect(screen.getByText("No posts published yet.")).toBeInTheDocument()
  })
})
