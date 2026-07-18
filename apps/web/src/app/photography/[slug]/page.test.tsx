import type { NotionBlockTree } from "@paulrdrs/content/blocks"
import { render, screen } from "@testing-library/react"
import { notFound, permanentRedirect } from "next/navigation"
import {
  getProjectSlugByPreviousSlug,
  getPublishedProjectBySlug,
  getPublishedProjectPhotos
} from "@/db/content"
import PhotographyProjectPage from "./page"

vi.mock("@/db/content", () => ({
  getProjectSlugByPreviousSlug: vi.fn(),
  getPublishedProjectBySlug: vi.fn(),
  getPublishedProjectPhotos: vi.fn()
}))

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
  permanentRedirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT")
  })
}))

const getPublishedProjectBySlugMock = vi.mocked(getPublishedProjectBySlug)
const getProjectSlugByPreviousSlugMock = vi.mocked(getProjectSlugByPreviousSlug)
const getPublishedProjectPhotosMock = vi.mocked(getPublishedProjectPhotos)
const permanentRedirectMock = vi.mocked(permanentRedirect)
const notFoundMock = vi.mocked(notFound)

const buildProject = (overrides: Record<string, unknown> = {}) => ({
  id: "project-id",
  title: "Camera Work",
  slug: "camera-work",
  category: "photography" as const,
  coverAltText: null,
  coverAttribution: null,
  coverMediaId: null,
  excerpt: "A published project.",
  body: null as NotionBlockTree | null,
  seoTitle: null,
  seoDescription: null,
  publishedAt: new Date("2026-01-01"),
  createdAt: new Date("2026-01-01"),
  ...overrides
})

describe("PhotographyProjectPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getPublishedProjectPhotosMock.mockResolvedValue([])
  })

  it("renders linked photos", async () => {
    getPublishedProjectBySlugMock.mockResolvedValue(buildProject())
    getPublishedProjectPhotosMock.mockResolvedValue([
      {
        id: "photo-id",
        title: "Pier at Dusk",
        slug: "pier-at-dusk",
        excerpt: null,
        coverAltText: null,
        coverAttribution: null,
        coverMediaId: "media-id"
      }
    ])

    render(
      await PhotographyProjectPage({
        params: Promise.resolve({ slug: "camera-work" })
      })
    )

    expect(getPublishedProjectBySlugMock).toHaveBeenCalledWith(
      "photography",
      "camera-work"
    )
    expect(
      screen.getAllByRole("link", { name: "Pier at Dusk" })[0]
    ).toHaveAttribute("href", "/photo/pier-at-dusk")
  })

  it("redirects an old slug within photography", async () => {
    getPublishedProjectBySlugMock.mockResolvedValue(undefined)
    getProjectSlugByPreviousSlugMock.mockResolvedValue("camera-work")

    await expect(
      PhotographyProjectPage({ params: Promise.resolve({ slug: "old-slug" }) })
    ).rejects.toThrow("NEXT_REDIRECT")
    expect(permanentRedirectMock).toHaveBeenCalledWith(
      "/photography/camera-work"
    )
  })

  it("returns 404 for an unknown slug", async () => {
    getPublishedProjectBySlugMock.mockResolvedValue(undefined)
    getProjectSlugByPreviousSlugMock.mockResolvedValue(undefined)

    await expect(
      PhotographyProjectPage({ params: Promise.resolve({ slug: "missing" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(notFoundMock).toHaveBeenCalled()
  })
})
