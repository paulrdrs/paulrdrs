import { render, screen } from "@testing-library/react"
import { getPublishedPhotos } from "@/db/content"
import PhotoGalleryPage from "./page"

vi.mock("@/db/content", () => ({
  getPublishedPhotos: vi.fn()
}))

const getPublishedPhotosMock = vi.mocked(getPublishedPhotos)

describe("PhotoGalleryPage", () => {
  it("renders published photos returned by the content query", async () => {
    getPublishedPhotosMock.mockResolvedValue([
      {
        id: "photo-id",
        title: "Pier at Dusk",
        slug: "pier-at-dusk",
        excerpt: "Golden hour.",
        coverAltText: null,
        coverAttribution: null,
        coverMediaId: "media-id",
        publishedAt: new Date("2026-01-01"),
        createdAt: new Date("2026-01-01")
      }
    ])

    render(await PhotoGalleryPage())

    expect(
      screen.getByRole("heading", { name: "Photography" })
    ).toBeInTheDocument()
    for (const link of screen.getAllByRole("link", {
      name: "Pier at Dusk"
    })) {
      expect(link).toHaveAttribute("href", "/photo/pier-at-dusk")
    }
    expect(
      screen.getByRole("img", { name: "Pier at Dusk" })
    ).toBeInTheDocument()
  })

  it("shows an empty state when no photos are published", async () => {
    getPublishedPhotosMock.mockResolvedValue([])

    render(await PhotoGalleryPage())

    expect(
      screen.getByText("No photographs published yet.")
    ).toBeInTheDocument()
  })
})
