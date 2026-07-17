import type { NotionBlock, RichText } from "@paulrdrs/content/blocks"
import { render, screen } from "@testing-library/react"
import { NotionBlocks } from "./NotionBlocks"

let counter = 0
const nextId = () => `block-${counter++}`

const text = (value: string): RichText[] => [
  {
    text: value,
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
]

const paragraph = (value: string): NotionBlock => ({
  id: nextId(),
  type: "paragraph",
  richText: text(value),
  children: []
})

const heading = (level: 1 | 2 | 3, value: string): NotionBlock => ({
  id: nextId(),
  type: `heading_${level}`,
  richText: text(value),
  children: []
})

const bullet = (value: string, children: NotionBlock[] = []): NotionBlock => ({
  id: nextId(),
  type: "bulleted_list_item",
  richText: text(value),
  children
})

const numbered = (value: string): NotionBlock => ({
  id: nextId(),
  type: "numbered_list_item",
  richText: text(value),
  children: []
})

describe("NotionBlocks", () => {
  it("renders paragraphs and headings", () => {
    const { container } = render(
      <NotionBlocks
        blocks={[
          heading(1, "Title"),
          heading(2, "Subtitle"),
          paragraph("Body")
        ]}
      />
    )

    expect(
      screen.getByRole("heading", { level: 1, name: "Title" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 2, name: "Subtitle" })
    ).toBeInTheDocument()
    expect(container.querySelector("p")).toHaveTextContent("Body")
  })

  it("groups consecutive list items and splits on interruptions", () => {
    const { container } = render(
      <NotionBlocks
        blocks={[
          bullet("One"),
          bullet("Two"),
          paragraph("Break"),
          bullet("Three"),
          numbered("First")
        ]}
      />
    )

    expect(container.querySelectorAll("ul")).toHaveLength(2)
    expect(container.querySelectorAll("ol")).toHaveLength(1)
    const firstList = container.querySelector("ul")
    expect(firstList?.querySelectorAll("li")).toHaveLength(2)
  })

  it("nests child blocks inside a list item", () => {
    const { container } = render(
      <NotionBlocks blocks={[bullet("Parent", [bullet("Child")])]} />
    )

    expect(container.querySelectorAll("ul")).toHaveLength(2)
    expect(screen.getByText("Child")).toBeInTheDocument()
  })

  it("renders quote, code, divider", () => {
    const { container } = render(
      <NotionBlocks
        blocks={[
          {
            id: nextId(),
            type: "quote",
            richText: text("Quoted"),
            children: []
          },
          {
            id: nextId(),
            type: "code",
            richText: text("const x = 1"),
            language: "ts",
            children: []
          },
          { id: nextId(), type: "divider", children: [] }
        ]}
      />
    )

    expect(container.querySelector("blockquote")).toHaveTextContent("Quoted")
    expect(container.querySelector("pre code")).toHaveTextContent("const x = 1")
    expect(container.querySelector("hr")).toBeInTheDocument()
  })

  it("renders an image via /media/[id]", () => {
    render(
      <NotionBlocks
        blocks={[
          {
            id: nextId(),
            type: "image",
            mediaId: "media-123",
            caption: text("A cat"),
            children: []
          }
        ]}
      />
    )

    expect(screen.getByRole("img", { name: "A cat" })).toHaveAttribute(
      "src",
      expect.stringContaining("url=%2Fmedia%2Fmedia-123")
    )
  })

  it("renders a callout with its icon", () => {
    const { container } = render(
      <NotionBlocks
        blocks={[
          {
            id: nextId(),
            type: "callout",
            richText: text("Heads up"),
            icon: "💡",
            children: []
          }
        ]}
      />
    )

    const callout = container.querySelector(".callout")
    expect(callout).toHaveTextContent("Heads up")
    expect(container.querySelector(".callout-icon")).toHaveTextContent("💡")
  })

  it("renders a toggle with its children", () => {
    const { container } = render(
      <NotionBlocks
        blocks={[
          {
            id: nextId(),
            type: "toggle",
            richText: text("Summary"),
            children: [paragraph("Hidden detail")]
          }
        ]}
      />
    )

    expect(container.querySelector("details > summary")).toHaveTextContent(
      "Summary"
    )
    expect(screen.getByText("Hidden detail")).toBeInTheDocument()
  })

  it("renders nothing for an unknown block type", () => {
    const { container } = render(
      <NotionBlocks
        blocks={[
          {
            id: nextId(),
            type: "unsupported",
            children: []
          } as unknown as NotionBlock
        ]}
      />
    )

    expect(container.querySelector(".markdown-content")?.children).toHaveLength(
      0
    )
  })
})
