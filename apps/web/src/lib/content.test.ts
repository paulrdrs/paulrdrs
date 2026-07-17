import type { NotionBlock, RichText } from "@paulrdrs/content/blocks"
import { blockTreeToPlainText, richTextToPlainText } from "./content"

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

const paragraph = (
  value: string,
  children: NotionBlock[] = []
): NotionBlock => ({
  id: crypto.randomUUID(),
  type: "paragraph",
  richText: text(value),
  children
})

describe("richTextToPlainText", () => {
  it("concatenates segment text", () => {
    expect(richTextToPlainText([...text("Hello "), ...text("world")])).toBe(
      "Hello world"
    )
  })
})

describe("blockTreeToPlainText", () => {
  it("joins block text across the tree", () => {
    expect(blockTreeToPlainText([paragraph("Hello"), paragraph("world")])).toBe(
      "Hello world"
    )
  })

  it("includes nested children", () => {
    expect(
      blockTreeToPlainText([paragraph("Parent", [paragraph("child")])])
    ).toBe("Parent child")
  })

  it("truncates long text", () => {
    expect(
      blockTreeToPlainText([paragraph("one two three four five")], 13)
    ).toBe("one two three...")
  })
})
