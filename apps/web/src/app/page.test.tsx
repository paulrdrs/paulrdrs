import { render, screen } from "@testing-library/react"
import {
  getPublishedHomeLinkedContentItem,
  getPublishedPageByKey
} from "@/db/content"
import Home from "./page"

vi.mock("@/db/content", () => ({
  getPublishedHomeLinkedContentItem: vi.fn(),
  getPublishedPageByKey: vi.fn()
}))

const getPublishedHomeLinkedContentItemMock = vi.mocked(
  getPublishedHomeLinkedContentItem
)
const getPublishedPageByKeyMock = vi.mocked(getPublishedPageByKey)

beforeEach(() => {
  vi.clearAllMocks()
})

describe("Home", () => {
  it("renders text blocks and linked content in Notion order", async () => {
    getPublishedPageByKeyMock.mockResolvedValue({
      body: [
        {
          children: [],
          id: "heading",
          richText: [
            {
              annotations: {
                bold: false,
                code: false,
                color: "default",
                italic: false,
                strikethrough: false,
                underline: false
              },
              href: null,
              text: "Home copy title"
            }
          ],
          type: "heading_1"
        },
        {
          children: [],
          id: "post-link",
          pageId: "notion-post-id",
          type: "link_to_page"
        },
        {
          children: [],
          id: "body-copy",
          richText: [
            {
              annotations: {
                bold: false,
                code: false,
                color: "default",
                italic: false,
                strikethrough: false,
                underline: false
              },
              href: null,
              text: "Text after the featured post"
            }
          ],
          type: "paragraph"
        }
      ],
      id: "page-id",
      key: "home",
      metadata: {},
      publishedAt: new Date("2026-01-01"),
      title: "Home copy title"
    })
    getPublishedHomeLinkedContentItemMock.mockResolvedValueOnce({
      coverAltText: null,
      coverAttribution: null,
      coverMediaId: null,
      excerpt: "A post excerpt.",
      href: "/blog/post-slug",
      id: "post-id",
      kind: "post",
      label: "Blog Post",
      slug: "post-slug",
      title: "Featured post"
    })

    const { container } = render(await Home())

    expect(
      container.querySelector('[data-feature-position="1"]')
    ).toHaveAttribute("href", "/blog/post-slug")
    expect(
      screen.getByRole("heading", { name: "Featured post" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Home copy title" })
    ).toBeInTheDocument()
    expect(screen.getByText("Text after the featured post")).toBeInTheDocument()
    const contentBlocks = container.querySelector("article")?.children
    expect(contentBlocks?.[0]).toHaveTextContent("Home copy title")
    expect(contentBlocks?.[1]).toHaveAttribute("href", "/blog/post-slug")
    expect(contentBlocks?.[2]).toHaveTextContent("Text after the featured post")
    expect(getPublishedHomeLinkedContentItemMock).toHaveBeenCalledWith(
      "notion-post-id"
    )
  })

  it("keeps surrounding Home content when a page link is unavailable", async () => {
    getPublishedPageByKeyMock.mockResolvedValue({
      body: [
        {
          children: [],
          id: "before",
          richText: [
            {
              annotations: {
                bold: false,
                code: false,
                color: "default",
                italic: false,
                strikethrough: false,
                underline: false
              },
              href: null,
              text: "Before"
            }
          ],
          type: "paragraph"
        },
        {
          children: [],
          id: "missing-link",
          pageId: "missing-page",
          type: "link_to_page"
        },
        {
          children: [],
          id: "after",
          richText: [
            {
              annotations: {
                bold: false,
                code: false,
                color: "default",
                italic: false,
                strikethrough: false,
                underline: false
              },
              href: null,
              text: "After"
            }
          ],
          type: "paragraph"
        }
      ],
      id: "page-id",
      key: "home",
      metadata: {},
      publishedAt: new Date("2026-01-01"),
      title: "Home"
    })
    getPublishedHomeLinkedContentItemMock.mockResolvedValueOnce(undefined)

    const { container } = render(await Home())

    expect(screen.getByText("Before")).toBeInTheDocument()
    expect(screen.getByText("After")).toBeInTheDocument()
    expect(container.querySelector("[data-feature-position]")).toBeNull()
  })

  it("renders the empty state when Home has no published body", async () => {
    getPublishedPageByKeyMock.mockResolvedValue(undefined)

    render(await Home())

    expect(screen.getByText("nothing to see here")).toBeInTheDocument()
    expect(getPublishedHomeLinkedContentItemMock).not.toHaveBeenCalled()
  })
})
