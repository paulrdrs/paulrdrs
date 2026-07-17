import type {
  NotionBlock,
  NotionBlockTree,
  RichText
} from "@paulrdrs/content/blocks"

export const createSlug = (value: string) => {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const richTextToPlainText = (richText: readonly RichText[]) =>
  richText.map((segment) => segment.text).join("")

const blockToPlainText = (block: NotionBlock): string => {
  const own = "richText" in block ? richTextToPlainText(block.richText) : ""
  const fromChildren = block.children.map(blockToPlainText).join(" ")
  return [own, fromChildren].filter(Boolean).join(" ")
}

export const blockTreeToPlainText = (
  body: NotionBlockTree,
  maxLength = 160
) => {
  const plainText = body
    .map(blockToPlainText)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  return `${plainText.slice(0, maxLength).trimEnd()}...`
}
