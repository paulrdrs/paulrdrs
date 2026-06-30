import { render, screen } from "@testing-library/react"
import { notFound, permanentRedirect } from "next/navigation"
import { trackPageView } from "@/analytics/server"
import {
  getProjectSlugByPreviousSlug,
  getPublishedProjectBySlug
} from "@/db/content"
import { isProjectCategory } from "@/db/contentTypes"
import type { NotionBlockTree } from "@/notion/types"
import ProjectPage from "./page"

vi.mock("@/analytics/server", () => ({ trackPageView: vi.fn() }))

vi.mock("@/db/content", () => ({
  getPublishedProjectBySlug: vi.fn(),
  getProjectSlugByPreviousSlug: vi.fn()
}))

vi.mock("@/db/contentTypes", () => ({
  isProjectCategory: vi.fn()
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
const isProjectCategoryMock = vi.mocked(isProjectCategory)
const trackPageViewMock = vi.mocked(trackPageView)
const permanentRedirectMock = vi.mocked(permanentRedirect)
const notFoundMock = vi.mocked(notFound)

const buildProject = (overrides: Record<string, unknown> = {}) => ({
  id: "project-id",
  title: "Camera Work",
  slug: "camera-work",
  category: "photography" as const,
  coverAltText: null,
  coverAttribution: null,
  coverHeight: null,
  coverMediaId: null,
  coverWidth: null,
  excerpt: "A published project.",
  body: null as NotionBlockTree | null,
  seoTitle: null,
  seoDescription: null,
  publishedAt: new Date("2026-01-01"),
  createdAt: new Date("2026-01-01"),
  ...overrides
})

const notionBody = (text: string): NotionBlockTree => [
  {
    id: "b1",
    type: "heading_2",
    richText: [
      {
        text,
        href: null,
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: "default"
        }
      }
    ],
    children: []
  }
]

describe("ProjectPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isProjectCategoryMock.mockReturnValue(true)
  })

  it("renders the project title without a Notion body", async () => {
    getPublishedProjectBySlugMock.mockResolvedValue(buildProject())

    render(
      await ProjectPage({
        params: Promise.resolve({
          category: "photography",
          slug: "camera-work"
        })
      })
    )

    expect(trackPageViewMock).toHaveBeenCalledWith({
      contentId: "project-id",
      contentType: "project",
      path: "/projects/photography/camera-work"
    })
    expect(
      screen.getByRole("heading", { level: 1, name: "Camera Work" })
    ).toBeInTheDocument()
  })

  it("renders Notion blocks when body is present", async () => {
    getPublishedProjectBySlugMock.mockResolvedValue(
      buildProject({ body: notionBody("From Notion") })
    )

    render(
      await ProjectPage({
        params: Promise.resolve({
          category: "photography",
          slug: "camera-work"
        })
      })
    )

    expect(
      screen.getByRole("heading", { level: 2, name: "From Notion" })
    ).toBeInTheDocument()
    expect(screen.queryByText("Project body")).not.toBeInTheDocument()
  })

  it("redirects an old slug to the current one", async () => {
    getPublishedProjectBySlugMock.mockResolvedValue(undefined)
    getProjectSlugByPreviousSlugMock.mockResolvedValue("camera-work")

    await expect(
      ProjectPage({
        params: Promise.resolve({ category: "photography", slug: "old-slug" })
      })
    ).rejects.toThrow("NEXT_REDIRECT")
    expect(permanentRedirectMock).toHaveBeenCalledWith(
      "/projects/photography/camera-work"
    )
  })

  it("returns 404 for an unknown slug with no history", async () => {
    getPublishedProjectBySlugMock.mockResolvedValue(undefined)
    getProjectSlugByPreviousSlugMock.mockResolvedValue(undefined)

    await expect(
      ProjectPage({
        params: Promise.resolve({ category: "photography", slug: "missing" })
      })
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(notFoundMock).toHaveBeenCalled()
  })
})
