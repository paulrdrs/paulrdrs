import { render, screen } from "@testing-library/react"
import { getPublishedPostsByTag } from "@/db/content"
import BlogTagPage from "./page"

vi.mock("@/db/content", () => ({
  getPublishedPostsByTag: vi.fn()
}))

const getPublishedPostsByTagMock = vi.mocked(getPublishedPostsByTag)

describe("BlogTagPage", () => {
  it("renders posts matching the requested tag", async () => {
    getPublishedPostsByTagMock.mockResolvedValue([
      {
        coverAltText: null,
        coverAttribution: null,
        coverMediaId: null,
        createdAt: new Date("2026-01-01"),
        excerpt: "A tagged post.",
        id: "post-id",
        publishedAt: new Date("2026-01-02"),
        slug: "tagged-post",
        tags: ["TypeScript"],
        title: "Tagged post"
      }
    ])

    render(
      await BlogTagPage({ params: Promise.resolve({ tag: "TypeScript" }) })
    )

    expect(
      screen.getByRole("heading", { name: "TypeScript" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Tagged post" })).toHaveAttribute(
      "href",
      "/blog/tagged-post"
    )
    expect(getPublishedPostsByTagMock).toHaveBeenCalledWith("TypeScript")
  })

  it("shows an empty state when no posts match the tag", async () => {
    getPublishedPostsByTagMock.mockResolvedValue([])

    render(
      await BlogTagPage({ params: Promise.resolve({ tag: "TypeScript" }) })
    )

    expect(
      screen.getByText("No posts tagged TypeScript yet.")
    ).toBeInTheDocument()
  })
})
