import { render, screen } from "@testing-library/react"
import { getPublishedProjectBySlug } from "@/db/content"
import SoftwareProjectPage from "./page"

vi.mock("@/db/content", () => ({
  getProjectSlugByPreviousSlug: vi.fn(),
  getPublishedProjectBySlug: vi.fn()
}))

const getPublishedProjectBySlugMock = vi.mocked(getPublishedProjectBySlug)

describe("SoftwareProjectPage", () => {
  it("loads and renders only the software project domain", async () => {
    getPublishedProjectBySlugMock.mockResolvedValue({
      id: "project-id",
      title: "Small Tool",
      slug: "small-tool",
      category: "software",
      coverAltText: null,
      coverAttribution: null,
      coverMediaId: null,
      excerpt: "A useful tool.",
      body: null,
      seoTitle: null,
      seoDescription: null,
      publishedAt: new Date("2026-01-01"),
      createdAt: new Date("2026-01-01")
    })

    render(
      await SoftwareProjectPage({
        params: Promise.resolve({ slug: "small-tool" })
      })
    )

    expect(getPublishedProjectBySlugMock).toHaveBeenCalledWith(
      "software",
      "small-tool"
    )
    expect(
      screen.getByRole("heading", { level: 1, name: "Small Tool" })
    ).toBeInTheDocument()
  })
})
