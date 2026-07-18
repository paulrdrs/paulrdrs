import type { NotionBlockTree } from "@paulrdrs/content/blocks"
import { render, screen } from "@testing-library/react"
import { notFound, permanentRedirect } from "next/navigation"
import {
  getPhotoProjects,
  getPhotoSlugByPreviousSlug,
  getPublishedPhotoBySlug
} from "@/db/content"
import PhotoPage from "./page"

vi.mock("@/db/content", () => ({
  getPhotoProjects: vi.fn(),
  getPhotoSlugByPreviousSlug: vi.fn(),
  getPublishedPhotoBySlug: vi.fn()
}))

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
  permanentRedirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT")
  })
}))

const getPublishedPhotoBySlugMock = vi.mocked(getPublishedPhotoBySlug)
const getPhotoSlugByPreviousSlugMock = vi.mocked(getPhotoSlugByPreviousSlug)
const getPhotoProjectsMock = vi.mocked(getPhotoProjects)
const permanentRedirectMock = vi.mocked(permanentRedirect)
const notFoundMock = vi.mocked(notFound)

const buildPhoto = (overrides: Record<string, unknown> = {}) => ({
  id: "photo-id",
  title: "Pier at Dusk",
  slug: "pier-at-dusk",
  excerpt: "Golden hour at the pier.",
  body: null as NotionBlockTree | null,
  coverAltText: null,
  coverAttribution: null,
  coverMediaId: "media-id",
  publishedAt: new Date("2026-01-01"),
  createdAt: new Date("2026-01-01"),
  ...overrides
})

describe("PhotoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getPhotoProjectsMock.mockResolvedValue([])
  })

  it("renders the photo title and image", async () => {
    getPublishedPhotoBySlugMock.mockResolvedValue(buildPhoto())

    render(
      await PhotoPage({ params: Promise.resolve({ slug: "pier-at-dusk" }) })
    )

    expect(
      screen.getByRole("heading", { level: 1, name: "Pier at Dusk" })
    ).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Pier at Dusk" })).toHaveAttribute(
      "src",
      expect.stringContaining(
        "url=https%3A%2F%2Fweb.paulrdrs.workers.dev%2Fmedia%2Fmedia-id"
      )
    )
  })

  it("lists the projects a photo appears in", async () => {
    getPublishedPhotoBySlugMock.mockResolvedValue(buildPhoto())
    getPhotoProjectsMock.mockResolvedValue([
      { category: "photography", slug: "coastline", title: "Coastline" }
    ])

    render(
      await PhotoPage({ params: Promise.resolve({ slug: "pier-at-dusk" }) })
    )

    expect(screen.getByText("Appears in")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Coastline" })).toHaveAttribute(
      "href",
      "/projects/photography/coastline"
    )
  })

  it("redirects an old slug to the current one", async () => {
    getPublishedPhotoBySlugMock.mockResolvedValue(undefined)
    getPhotoSlugByPreviousSlugMock.mockResolvedValue("pier-at-dusk")

    await expect(
      PhotoPage({ params: Promise.resolve({ slug: "old-slug" }) })
    ).rejects.toThrow("NEXT_REDIRECT")
    expect(permanentRedirectMock).toHaveBeenCalledWith("/photo/pier-at-dusk")
  })

  it("returns 404 for an unknown slug with no history", async () => {
    getPublishedPhotoBySlugMock.mockResolvedValue(undefined)
    getPhotoSlugByPreviousSlugMock.mockResolvedValue(undefined)

    await expect(
      PhotoPage({ params: Promise.resolve({ slug: "missing" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(notFoundMock).toHaveBeenCalled()
  })
})
