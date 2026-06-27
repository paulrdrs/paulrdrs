import type { ReactNode } from "react"
import { ContentImage } from "@/components/ContentImage"
import { NotionRichText } from "@/components/NotionRichText"
import { richTextToPlainText } from "@/lib/content"
import type {
  BulletedListItemBlock,
  NotionBlock,
  NotionBlockTree,
  NumberedListItemBlock
} from "@/notion/types"

type ListItemBlock = BulletedListItemBlock | NumberedListItemBlock

function isListItem(block: NotionBlock): block is ListItemBlock {
  return (
    block.type === "bulleted_list_item" || block.type === "numbered_list_item"
  )
}

function BlockChildren({ block }: { block: NotionBlock }) {
  if (block.children.length === 0) {
    return null
  }
  return <BlockSequence blocks={block.children} />
}

function BlockItem({ block }: { block: NotionBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p>
          <NotionRichText richText={block.richText} />
        </p>
      )
    case "heading_1":
      return (
        <h1>
          <NotionRichText richText={block.richText} />
        </h1>
      )
    case "heading_2":
      return (
        <h2>
          <NotionRichText richText={block.richText} />
        </h2>
      )
    case "heading_3":
      return (
        <h3>
          <NotionRichText richText={block.richText} />
        </h3>
      )
    case "quote":
      return (
        <blockquote>
          <NotionRichText richText={block.richText} />
          <BlockChildren block={block} />
        </blockquote>
      )
    case "code":
      return (
        <pre>
          <code
            className={
              block.language ? `language-${block.language}` : undefined
            }
          >
            {richTextToPlainText(block.richText)}
          </code>
        </pre>
      )
    case "image": {
      const caption = richTextToPlainText(block.caption)
      return (
        <ContentImage
          alt={caption}
          attribution={caption || null}
          id={block.mediaId}
        />
      )
    }
    case "divider":
      return <hr />
    case "callout":
      return (
        <aside className="callout">
          {block.icon ? (
            <span className="callout-icon">{block.icon}</span>
          ) : null}
          <div>
            <NotionRichText richText={block.richText} />
            <BlockChildren block={block} />
          </div>
        </aside>
      )
    case "toggle":
      return (
        <details className="toggle">
          <summary>
            <NotionRichText richText={block.richText} />
          </summary>
          <BlockChildren block={block} />
        </details>
      )
    default:
      // List items are rendered by BlockSequence's grouping; unknown block
      // types render nothing.
      return null
  }
}

function BlockSequence({ blocks }: { blocks: NotionBlockTree }) {
  const nodes: ReactNode[] = []
  let index = 0

  while (index < blocks.length) {
    const block = blocks[index]

    if (isListItem(block)) {
      const listType = block.type
      const items: ListItemBlock[] = []
      while (index < blocks.length) {
        const candidate = blocks[index]
        if (!isListItem(candidate) || candidate.type !== listType) {
          break
        }
        items.push(candidate)
        index += 1
      }

      const ListTag = listType === "bulleted_list_item" ? "ul" : "ol"
      nodes.push(
        <ListTag key={items[0].id}>
          {items.map((item) => (
            <li key={item.id}>
              <NotionRichText richText={item.richText} />
              <BlockChildren block={item} />
            </li>
          ))}
        </ListTag>
      )
      continue
    }

    nodes.push(<BlockItem block={block} key={block.id} />)
    index += 1
  }

  return <>{nodes}</>
}

type NotionBlocksProps = {
  blocks: NotionBlockTree
}

export const NotionBlocks = ({ blocks }: NotionBlocksProps) => {
  return (
    <article className="markdown-content">
      <BlockSequence blocks={blocks} />
    </article>
  )
}
