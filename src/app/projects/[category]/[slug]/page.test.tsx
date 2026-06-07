import { render, screen } from "@testing-library/react"
import { getPublishedProjectBySlug } from "@/db/content"
import { isProjectCategory } from "@/db/contentTypes"
import ProjectPage from "./page"

vi.mock("@/db/content", () => ({
  getPublishedProjectBySlug: vi.fn()
}))

vi.mock("@/db/contentTypes", () => ({
  isProjectCategory: vi.fn()
}))

const getPublishedProjectBySlugMock = vi.mocked(getPublishedProjectBySlug)
const isProjectCategoryMock = vi.mocked(isProjectCategory)

describe("ProjectPage", () => {
  it("renders a published project by category and slug", async () => {
    isProjectCategoryMock.mockReturnValue(true)
    getPublishedProjectBySlugMock.mockResolvedValue({
      id: "project-id",
      title: "Camera Work",
      slug: "camera-work",
      category: "photography",
      excerpt: "A published project.",
      bodyMarkdown: "# Project body",
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
    expect(
      screen.getByRole("heading", { level: 1, name: "Camera Work" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View project" })).toHaveAttribute(
      "href",
      "https://example.com"
    )
  })
})
