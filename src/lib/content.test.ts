import type { NotionBlock, RichText } from "@/notion/types"
import {
  blockTreeToPlainText,
  createSlug,
  richTextToPlainText
} from "./content"

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

describe("createSlug", () => {
  it("normalizes text into a URL slug", () => {
    expect(createSlug("Olá, World! This is Paulo's Site")).toBe(
      "ola-world-this-is-paulos-site"
    )
  })

  it("collapses repeated separators", () => {
    expect(createSlug("  Software   /   Photography  ")).toBe(
      "software-photography"
    )
  })
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
