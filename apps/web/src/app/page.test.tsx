import type { NotionBlockTree } from "@paulrdrs/content/blocks"
import { render, screen } from "@testing-library/react"
import { getPublishedPageByKey } from "@/db/content"
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

vi.mock("@/db/content", () => ({
  getPublishedPageByKey: vi.fn()
}))

const getPublishedPageByKeyMock = vi.mocked(getPublishedPageByKey)

describe("Home", () => {
  it("renders the homepage title without a Notion body", async () => {
    getPublishedPageByKeyMock.mockResolvedValue({
      body: null,
      id: "page-id",
      key: "home",
      metadata: null,
      publishedAt: new Date("2026-01-01"),
      title: "Home intro"
    })

    render(await Home())

    expect(getPublishedPageByKeyMock).toHaveBeenCalledWith("home")
    expect(
      screen.getByRole("heading", { name: "Home intro" })
    ).toBeInTheDocument()
    expect(screen.queryByText("copy")).not.toBeInTheDocument()
  })

  it("renders Notion blocks when homepage body is present", async () => {
    getPublishedPageByKeyMock.mockResolvedValue({
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
