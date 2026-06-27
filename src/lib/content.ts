import type { NotionBlock, NotionBlockTree, RichText } from "@/notion/types"

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

export const createExcerpt = (markdown: string, maxLength = 160) => {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  return `${plainText.slice(0, maxLength).trimEnd()}...`
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
