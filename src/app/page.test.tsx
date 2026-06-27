import { render, screen } from "@testing-library/react"
import { trackPageView } from "@/analytics/server"
import { getPublishedPageByKey } from "@/db/content"
import type { NotionBlockTree } from "@/notion/types"
import Home from "./page"

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

vi.mock("@/analytics/server", () => ({
  trackPageView: vi.fn()
}))

vi.mock("@/db/content", () => ({
  getPublishedPageByKey: vi.fn()
}))

const trackPageViewMock = vi.mocked(trackPageView)
const getPublishedPageByKeyMock = vi.mocked(getPublishedPageByKey)

describe("Home", () => {
  beforeEach(() => {
    trackPageViewMock.mockReset()
  })

  it("renders published CMS homepage content", async () => {
    getPublishedPageByKeyMock.mockResolvedValue({
      bodyMarkdown: "Intro **copy**.",
      body: null,
      id: "page-id",
      key: "home",
      metadata: null,
      publishedAt: new Date("2026-01-01"),
      title: "Home intro"
    })

    render(await Home())

    expect(getPublishedPageByKeyMock).toHaveBeenCalledWith("home")
    expect(trackPageViewMock).toHaveBeenCalledWith({
      contentId: "page-id",
      contentType: "page",
      path: "/"
    })
    expect(
      screen.getByRole("heading", { name: "Home intro" })
    ).toBeInTheDocument()
    expect(screen.getByText("copy")).toBeInTheDocument()
  })

  it("renders Notion blocks when homepage body is present", async () => {
    getPublishedPageByKeyMock.mockResolvedValue({
      bodyMarkdown: "Intro **copy**.",
      body: notionBody("Notion home"),
      id: "page-id",
      key: "home",
      metadata: null,
      publishedAt: new Date("2026-01-01"),
      title: "Home intro"
    })

    render(await Home())

    expect(
      screen.getByRole("heading", { level: 2, name: "Notion home" })
    ).toBeInTheDocument()
    expect(screen.queryByText("copy")).not.toBeInTheDocument()
  })

  it("renders a fallback when homepage content is missing", async () => {
    getPublishedPageByKeyMock.mockImplementationOnce(async () => undefined)

    render(await Home())

    expect(screen.getByText("paulrdrs")).toBeInTheDocument()
  })
})
