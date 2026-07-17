import { render, screen } from "@testing-library/react"
import { getPublishedProjects } from "@/db/content"
import PhotographyPage from "./page"

vi.mock("@/db/content", () => ({
  getPublishedProjects: vi.fn()
}))

const getPublishedProjectsMock = vi.mocked(getPublishedProjects)

describe("PhotographyPage", () => {
  it("renders photography projects at their top-level route", async () => {
    getPublishedProjectsMock.mockResolvedValue([
      {
        id: "project-id",
        title: "Camera Work",
        slug: "camera-work",
        category: "photography",
        coverAltText: null,
        coverAttribution: null,
        coverMediaId: null,
        excerpt: "A published project.",
        publishedAt: new Date("2026-01-01"),
        createdAt: new Date("2026-01-01")
      }
    ])

    render(await PhotographyPage())

    expect(
      screen.getByRole("heading", { name: "Photography" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Camera Work" })).toHaveAttribute(
      "href",
      "/photography/camera-work"
    )
    expect(getPublishedProjectsMock).toHaveBeenCalledWith("photography")
  })
})
