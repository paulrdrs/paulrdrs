import "server-only"
import {
  type BlockObjectResponse,
  collectPaginatedAPI,
  isFullBlock,
  type RichTextItemResponse
} from "@notionhq/client"
import { getNotionClient } from "./client"
import { getNotionImageSourceKey, rehostImage } from "./media"
import type {
  NotionBlock,
  NotionBlockTree,
  NotionImageSource,
  RichText
} from "./types"

const toRichText = (items: readonly RichTextItemResponse[]): RichText[] =>
  items.map((item) => ({
    annotations: { ...item.annotations },
    href: item.href,
    text: item.plain_text
  }))

type RawImage =
  | { type: "external"; external: { url: string } }
  | { type: "file"; file: { url: string } }

const toImageSource = (image: RawImage): NotionImageSource =>
  image.type === "external"
    ? { type: "external", url: image.external.url }
    : { type: "file", url: image.file.url }

const fetchChildren = async (blockId: string): Promise<NotionBlockTree> => {
  const client = getNotionClient()
  const results = await collectPaginatedAPI(client.blocks.children.list, {
    block_id: blockId
  })

  const blocks: NotionBlock[] = []

  for (const result of results) {
    if (!isFullBlock(result)) {
      continue
    }

    const block = await toNotionBlock(result)

    if (block) {
      blocks.push(block)
    }
  }

  return blocks
}

const toNotionBlock = async (
  block: BlockObjectResponse
): Promise<NotionBlock | null> => {
  const children = block.has_children ? await fetchChildren(block.id) : []

  switch (block.type) {
    case "paragraph":
      return {
        children,
        id: block.id,
        richText: toRichText(block.paragraph.rich_text),
        type: "paragraph"
      }
    case "heading_1":
      return {
        children,
        id: block.id,
        richText: toRichText(block.heading_1.rich_text),
        type: "heading_1"
      }
    case "heading_2":
      return {
        children,
        id: block.id,
        richText: toRichText(block.heading_2.rich_text),
        type: "heading_2"
      }
    case "heading_3":
      return {
        children,
        id: block.id,
        richText: toRichText(block.heading_3.rich_text),
        type: "heading_3"
      }
    case "bulleted_list_item":
      return {
        children,
        id: block.id,
        richText: toRichText(block.bulleted_list_item.rich_text),
        type: "bulleted_list_item"
      }
    case "numbered_list_item":
      return {
        children,
        id: block.id,
        richText: toRichText(block.numbered_list_item.rich_text),
        type: "numbered_list_item"
      }
    case "quote":
      return {
        children,
        id: block.id,
        richText: toRichText(block.quote.rich_text),
        type: "quote"
      }
    case "code":
      return {
        children,
        id: block.id,
        language: block.code.language,
        richText: toRichText(block.code.rich_text),
        type: "code"
      }
    case "divider":
      return { children, id: block.id, type: "divider" }
    case "callout": {
      const icon = block.callout.icon
      return {
        children,
        icon: icon?.type === "emoji" ? icon.emoji : null,
        id: block.id,
        richText: toRichText(block.callout.rich_text),
        type: "callout"
      }
    }
    case "toggle":
      return {
        children,
        id: block.id,
        richText: toRichText(block.toggle.rich_text),
        type: "toggle"
      }
    case "image": {
      const source = toImageSource(block.image)
      const sourceKey = getNotionImageSourceKey(source)
      const mediaId = await rehostImage(source.url, sourceKey)

      return {
        caption: toRichText(block.image.caption),
        children,
        id: block.id,
        mediaId,
        type: "image"
      }
    }
    default:
      return null
  }
}

export const fetchPageBlocks = (pageId: string) => fetchChildren(pageId)
