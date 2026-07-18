import { render, screen } from "@testing-library/react"
import { getFeaturedHomeContentItem, getPublishedPageByKey } from "@/db/content"
import Home from "./page"

vi.mock("@/db/content", () => ({
  getFeaturedHomeContentItem: vi.fn(),
  getPublishedPageByKey: vi.fn()
}))

const getFeaturedHomeContentItemMock = vi.mocked(getFeaturedHomeContentItem)
const getPublishedPageByKeyMock = vi.mocked(getPublishedPageByKey)

beforeEach(() => {
  vi.clearAllMocks()
})

describe("Home", () => {
  it("renders the ordered Notion selections without Home body copy", async () => {
    getPublishedPageByKeyMock.mockResolvedValue({
      body: [
        {
          children: [],
          id: "body-copy",
          richText: [],
          type: "paragraph"
        }
      ],
      id: "page-id",
      key: "home",
      metadata: {
        featuredContent: [
          { id: "post-id", kind: "post" },
          { id: "project-id", kind: "project" }
        ]
      },
      publishedAt: new Date("2026-01-01"),
      title: "Home copy title"
    })
    getFeaturedHomeContentItemMock
      .mockResolvedValueOnce({
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
      .mockResolvedValueOnce({
        category: "software",
        coverAltText: null,
        coverAttribution: null,
        coverMediaId: null,
        excerpt: "A project excerpt.",
        href: "/software/project-slug",
        id: "project-id",
        kind: "project",
        label: "Software Project",
        slug: "project-slug",
        title: "Featured project"
      })

    const { container } = render(await Home())

    expect(
      container.querySelector('[data-feature-position="1"]')
    ).toHaveAttribute("href", "/blog/post-slug")
    expect(
      container.querySelector('[data-feature-position="2"]')
    ).toHaveAttribute("href", "/software/project-slug")
    expect(
      screen.getByRole("heading", { name: "Featured post" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Featured project" })
    ).toBeInTheDocument()
    expect(screen.queryByText("Home copy title")).not.toBeInTheDocument()
  })

  it("renders the empty state when Home has no valid selections", async () => {
    getPublishedPageByKeyMock.mockResolvedValue(undefined)

    render(await Home())

    expect(screen.getByText("nothing to see here")).toBeInTheDocument()
    expect(getFeaturedHomeContentItemMock).not.toHaveBeenCalled()
  })
})
