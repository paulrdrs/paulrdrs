import type { RichText, RichTextAnnotations } from "@paulrdrs/content/blocks"
import { render } from "@testing-library/react"
import { NotionRichText } from "./NotionRichText"

const annotations = (
  overrides: Partial<RichTextAnnotations> = {}
): RichTextAnnotations => ({
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
  code: false,
  color: "default",
  ...overrides
})

const rt = (
  text: string,
  overrides: Partial<RichTextAnnotations> = {},
  href: string | null = null
): RichText => ({ text, href, annotations: annotations(overrides) })

describe("NotionRichText", () => {
  it("renders each supported mark", () => {
    const { container } = render(
      <NotionRichText
        richText={[
          rt("bold", { bold: true }),
          rt("italic", { italic: true }),
          rt("struck", { strikethrough: true }),
          rt("coded", { code: true })
        ]}
      />
    )

    expect(container.querySelector("strong")).toHaveTextContent("bold")
    expect(container.querySelector("em")).toHaveTextContent("italic")
    expect(container.querySelector("s")).toHaveTextContent("struck")
    expect(container.querySelector("code")).toHaveTextContent("coded")
  })

  it("renders links with their href", () => {
    const { container } = render(
      <NotionRichText richText={[rt("a link", {}, "https://example.com")]} />
    )

    const link = container.querySelector("a")
    expect(link).toHaveAttribute("href", "https://example.com")
    expect(link).toHaveTextContent("a link")
  })

  it("nests combined marks", () => {
    const { container } = render(
      <NotionRichText richText={[rt("both", { bold: true, italic: true })]} />
    )

    expect(container.querySelector("em strong")).toHaveTextContent("both")
  })

  it("wraps colored text in a color class", () => {
    const { container } = render(
      <NotionRichText richText={[rt("warn", { color: "red" })]} />
    )

    expect(container.querySelector("span.notion-color-red")).toHaveTextContent(
      "warn"
    )
  })
})
