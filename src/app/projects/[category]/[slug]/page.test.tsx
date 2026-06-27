import { render, screen } from "@testing-library/react"
import { trackPageView } from "@/analytics/server"
import { getPublishedProjectBySlug } from "@/db/content"
import { isProjectCategory } from "@/db/contentTypes"
import ProjectPage from "./page"

vi.mock("@/analytics/server", () => ({
  trackPageView: vi.fn()
}))

vi.mock("@/db/content", () => ({
  getPublishedProjectBySlug: vi.fn()
}))

vi.mock("@/db/contentTypes", () => ({
  isProjectCategory: vi.fn()
}))

const getPublishedProjectBySlugMock = vi.mocked(getPublishedProjectBySlug)
const isProjectCategoryMock = vi.mocked(isProjectCategory)
const trackPageViewMock = vi.mocked(trackPageView)

describe("ProjectPage", () => {
  beforeEach(() => {
    trackPageViewMock.mockReset()
  })

  it("renders a published project by category and slug", async () => {
    isProjectCategoryMock.mockReturnValue(true)
    getPublishedProjectBySlugMock.mockResolvedValue({
      id: "project-id",
      title: "Camera Work",
      slug: "camera-work",
      category: "photography",
      coverAltText: null,
      coverAttribution: null,
      coverHeight: null,
      coverMediaId: null,
      coverWidth: null,
      excerpt: "A published project.",
      bodyMarkdown: "# Project body",
      seoTitle: null,
      seoDescription: null,
      links: [{ label: "View project", url: "https://example.com" }],
      publishedAt: new Date("2026-01-01"),
      createdAt: new Date("2026-01-01")
    })

    render(
      await ProjectPage({
        params: Promise.resolve({
          category: "photography",
          slug: "camera-work"
        })
      })
    )

    expect(isProjectCategoryMock).toHaveBeenCalledWith("photography")
    expect(getPublishedProjectBySlugMock).toHaveBeenCalledWith(
      "photography",
      "camera-work"
    )
    expect(trackPageViewMock).toHaveBeenCalledWith({
      contentId: "project-id",
      contentType: "project",
      path: "/projects/photography/camera-work"
    })
    expect(
      screen.getByRole("heading", { level: 1, name: "Camera Work" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View project" })).toHaveAttribute(
      "href",
      "https://example.com"
    )
  })
})
