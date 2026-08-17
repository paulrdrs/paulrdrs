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
  it("renders each Notion selection with its content-type snippet", async () => {
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
          { id: "software-project-id", kind: "project" },
          { id: "photography-project-id", kind: "project" }
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
        publishedAt: "2026-01-02T00:00:00.000Z" as unknown as Date,
        slug: "post-slug",
        tags: ["Design"],
        title: "Featured post"
      })
      .mockResolvedValueOnce({
        category: "software",
        coverAltText: null,
        coverAttribution: null,
        coverMediaId: null,
        excerpt: "A project excerpt.",
        href: "/software/project-slug",
        id: "software-project-id",
        kind: "project",
        slug: "project-slug",
        title: "Featured project"
      })
      .mockResolvedValueOnce({
        category: "photography",
        coverAltText: null,
        coverAttribution: null,
        coverMediaId: null,
        excerpt: "A photography project excerpt.",
        href: "/photography/project-slug",
        id: "photography-project-id",
        kind: "project",
        slug: "project-slug",
        title: "Featured photography project"
      })

    render(await Home())

    expect(screen.getByRole("link", { name: "Featured post" })).toHaveAttribute(
      "href",
      "/blog/post-slug"
    )
    expect(
      screen.getByRole("link", { name: "Featured project" })
    ).toHaveAttribute("href", "/software/project-slug")
    expect(
      screen.getByRole("link", { name: "Featured photography project" })
    ).toHaveAttribute("href", "/photography/project-slug")
    expect(
      screen.getByRole("heading", { name: "Featured post" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Featured project" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Featured photography project" })
    ).toBeInTheDocument()
    expect(screen.getAllByText("Jan 2, 2026")).toHaveLength(2)
    expect(screen.getByText("Design")).toBeInTheDocument()
    expect(screen.queryByText("Home copy title")).not.toBeInTheDocument()
  })

  it("renders the empty state when Home has no valid selections", async () => {
    getPublishedPageByKeyMock.mockResolvedValue(undefined)

    render(await Home())

    expect(screen.getByText("nothing to see here")).toBeInTheDocument()
    expect(getFeaturedHomeContentItemMock).not.toHaveBeenCalled()
  })
})
