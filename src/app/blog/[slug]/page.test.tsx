import { render, screen } from "@testing-library/react"
import { notFound, permanentRedirect } from "next/navigation"
import { trackPageView } from "@/analytics/server"
import { getPostSlugByPreviousSlug, getPublishedPostBySlug } from "@/db/content"
import type { NotionBlockTree } from "@/notion/types"
import BlogPostPage from "./page"

vi.mock("@/analytics/server", () => ({ trackPageView: vi.fn() }))

vi.mock("@/db/content", () => ({
  getPublishedPostBySlug: vi.fn(),
  getPostSlugByPreviousSlug: vi.fn()
}))

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
  permanentRedirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT")
  })
}))

const trackPageViewMock = vi.mocked(trackPageView)
const getPublishedPostBySlugMock = vi.mocked(getPublishedPostBySlug)
const getPostSlugByPreviousSlugMock = vi.mocked(getPostSlugByPreviousSlug)
const permanentRedirectMock = vi.mocked(permanentRedirect)
const notFoundMock = vi.mocked(notFound)

const buildPost = (overrides: Record<string, unknown> = {}) => ({
  id: "post-id",
  title: "Hello Post",
  slug: "hello-post",
  excerpt: "A published post.",
  body: null as NotionBlockTree | null,
  seoTitle: null,
  seoDescription: null,
  coverAltText: null,
  coverAttribution: null,
  coverHeight: null,
  coverMediaId: null,
  coverWidth: null,
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

describe("BlogPostPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the post title without a Notion body", async () => {
    getPublishedPostBySlugMock.mockResolvedValue(buildPost())

    render(
      await BlogPostPage({ params: Promise.resolve({ slug: "hello-post" }) })
    )

    expect(trackPageViewMock).toHaveBeenCalledWith({
      contentId: "post-id",
      contentType: "post",
      path: "/blog/hello-post"
    })
    expect(
      screen.getByRole("heading", { level: 1, name: "Hello Post" })
    ).toBeInTheDocument()
    // Legacy Markdown is no longer rendered; only the Notion block tree is.
    expect(screen.queryByText("Body heading")).not.toBeInTheDocument()
  })

  it("renders Notion blocks when body is present", async () => {
    getPublishedPostBySlugMock.mockResolvedValue(
      buildPost({ body: notionBody("From Notion") })
    )

    render(
      await BlogPostPage({ params: Promise.resolve({ slug: "hello-post" }) })
    )

    expect(
      screen.getByRole("heading", { level: 2, name: "From Notion" })
    ).toBeInTheDocument()
    expect(screen.queryByText("Body heading")).not.toBeInTheDocument()
  })

  it("redirects an old slug to the current one", async () => {
    getPublishedPostBySlugMock.mockResolvedValue(undefined)
    getPostSlugByPreviousSlugMock.mockResolvedValue("hello-post")

    await expect(
      BlogPostPage({ params: Promise.resolve({ slug: "old-slug" }) })
    ).rejects.toThrow("NEXT_REDIRECT")
    expect(permanentRedirectMock).toHaveBeenCalledWith("/blog/hello-post")
  })

  it("returns 404 for an unknown slug with no history", async () => {
    getPublishedPostBySlugMock.mockResolvedValue(undefined)
    getPostSlugByPreviousSlugMock.mockResolvedValue(undefined)

    await expect(
      BlogPostPage({ params: Promise.resolve({ slug: "missing" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(notFoundMock).toHaveBeenCalled()
  })
})
