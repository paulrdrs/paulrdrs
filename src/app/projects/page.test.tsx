import { render, screen } from "@testing-library/react"
import { getPublishedProjects } from "@/db/content"
import ProjectsPage from "./page"

vi.mock("@/db/content", () => ({
  getPublishedProjects: vi.fn()
}))

const getPublishedProjectsMock = vi.mocked(getPublishedProjects)

describe("ProjectsPage", () => {
  it("renders published projects returned by the content query", async () => {
    getPublishedProjectsMock.mockResolvedValue([
      {
        id: "project-id",
        title: "Camera Work",
        slug: "camera-work",
        category: "photography",
        excerpt: "A published project.",
        publishedAt: new Date("2026-01-01"),
        createdAt: new Date("2026-01-01")
      }
    ])

    render(await ProjectsPage())

    expect(
      screen.getByRole("heading", { name: "Projects" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Camera Work" })).toHaveAttribute(
      "href",
      "/projects/photography/camera-work"
    )
    expect(screen.getByText("A published project.")).toBeInTheDocument()
  })
})
