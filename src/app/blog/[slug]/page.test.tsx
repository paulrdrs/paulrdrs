import { render, screen } from "@testing-library/react"
import { getPublishedPostBySlug } from "@/db/content"
import BlogPostPage from "./page"

vi.mock("@/db/content", () => ({
  getPublishedPostBySlug: vi.fn()
}))

const getPublishedPostBySlugMock = vi.mocked(getPublishedPostBySlug)

describe("BlogPostPage", () => {
  it("renders a published post by slug", async () => {
    getPublishedPostBySlugMock.mockResolvedValue({
      id: "post-id",
      title: "Hello Post",
      slug: "hello-post",
      excerpt: "A published post.",
      bodyMarkdown: "# Body heading",
      publishedAt: new Date("2026-01-01"),
      createdAt: new Date("2026-01-01")
    })

    render(
      await BlogPostPage({ params: Promise.resolve({ slug: "hello-post" }) })
    )

    expect(getPublishedPostBySlugMock).toHaveBeenCalledWith("hello-post")
    expect(
      screen.getByRole("heading", { level: 1, name: "Hello Post" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 1, name: "Body heading" })
    ).toBeInTheDocument()
  })
})
