import {
  type BlockObjectResponse,
  collectPaginatedAPI,
  isFullBlock,
  type RichTextItemResponse
} from "@notionhq/client"
import type {
  NotionBlock,
  NotionBlockTree,
  RichText
} from "@paulrdrs/content/blocks"
import type { NotionImageSource } from "./imageSource"
import { getNotionImageSourceKey, rehostImage } from "./media"
import type { NotionSyncRuntime } from "./runtime"

const toRichText = (items: readonly RichTextItemResponse[]): RichText[] =>
  items.map((item) => ({
    annotations: { ...item.annotations },
    href: item.href,
    text: item.plain_text
  }))

type RawImage =
  | { type: "external"; external: { url: string } }
  | { type: "file"; file: { url: string } }

const supportedBlockTypes: ReadonlySet<string> = new Set<NotionBlock["type"]>([
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "bulleted_list_item",
  "numbered_list_item",
  "quote",
  "code",
  "image",
  "link_to_page",
  "divider",
  "callout",
  "toggle"
])

const toImageSource = (image: RawImage): NotionImageSource =>
  image.type === "external"
    ? { type: "external", url: image.external.url }
    : { type: "file", url: image.file.url }

const fetchChildren = async (
  runtime: NotionSyncRuntime,
  blockId: string
): Promise<NotionBlockTree> => {
  const results = await collectPaginatedAPI(
    runtime.notion.blocks.children.list,
    { block_id: blockId }
  )

  const blocks: NotionBlock[] = []

  for (const result of results) {
    if (!isFullBlock(result)) {
      continue
    }

    const block = await toNotionBlock(runtime, result)

    if (block) {
      blocks.push(block)
    }
  }

  return blocks
}

const toNotionBlock = async (
  runtime: NotionSyncRuntime,
  block: BlockObjectResponse
): Promise<NotionBlock | null> => {
  if (!supportedBlockTypes.has(block.type)) {
    return null
  }

  const children = block.has_children
    ? await fetchChildren(runtime, block.id)
    : []

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
      const mediaId = await rehostImage(runtime, source.url, sourceKey)

      return {
        caption: toRichText(block.image.caption),
        children,
        id: block.id,
        mediaId,
        type: "image"
      }
    }
    case "link_to_page":
      return block.link_to_page.type === "page_id"
        ? {
            children,
            id: block.id,
            pageId: block.link_to_page.page_id,
            type: "link_to_page"
          }
        : null
    default:
      return null
  }
}

export const fetchPageBlocks = (runtime: NotionSyncRuntime, pageId: string) =>
  fetchChildren(runtime, pageId)
