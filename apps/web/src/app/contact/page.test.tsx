import type { NotionBlockTree } from "@paulrdrs/content/blocks"
import { render, screen } from "@testing-library/react"
import { getPublishedPageByKey } from "@/db/content"
import ContactPage from "./page"

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

describe("ContactPage", () => {
  it("renders the contact title without a Notion body", async () => {
    getPublishedPageByKeyMock.mockResolvedValue({
      body: null,
      id: "page-id",
      key: "contact",
      metadata: null,
      publishedAt: new Date("2026-01-01"),
      title: "Reach me"
    })

    render(await ContactPage())

    expect(getPublishedPageByKeyMock).toHaveBeenCalledWith("contact")
    expect(
      screen.getByRole("heading", { name: "Reach me" })
    ).toBeInTheDocument()
    // Legacy Markdown is no longer rendered; only the Notion block tree is.
    expect(screen.queryByText("hello@example.com")).not.toBeInTheDocument()
  })

  it("renders Notion blocks when contact body is present", async () => {
    getPublishedPageByKeyMock.mockResolvedValue({
      body: notionBody("Notion contact"),
      id: "page-id",
      key: "contact",
      metadata: null,
      publishedAt: new Date("2026-01-01"),
      title: "Reach me"
    })

    render(await ContactPage())

    expect(
      screen.getByRole("heading", { level: 2, name: "Notion contact" })
    ).toBeInTheDocument()
    expect(screen.queryByText("hello@example.com")).not.toBeInTheDocument()
  })

  it("renders a fallback when contact content is missing", async () => {
    getPublishedPageByKeyMock.mockImplementationOnce(async () => undefined)

    render(await ContactPage())

    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument()
    expect(
      screen.getByText("Contact details will live here.")
    ).toBeInTheDocument()
  })
})
