export type RichTextAnnotations = {
  readonly bold: boolean
  readonly italic: boolean
  readonly strikethrough: boolean
  readonly underline: boolean
  readonly code: boolean
  readonly color: string
}

export type RichText = {
  readonly text: string
  readonly href: string | null
  readonly annotations: RichTextAnnotations
}

type NotionBlockBase = {
  readonly id: string
  readonly children: readonly NotionBlock[]
}

export type ParagraphBlock = NotionBlockBase & {
  readonly type: "paragraph"
  readonly richText: readonly RichText[]
}

export type Heading1Block = NotionBlockBase & {
  readonly type: "heading_1"
  readonly richText: readonly RichText[]
}

export type Heading2Block = NotionBlockBase & {
  readonly type: "heading_2"
  readonly richText: readonly RichText[]
}

export type Heading3Block = NotionBlockBase & {
  readonly type: "heading_3"
  readonly richText: readonly RichText[]
}

export type BulletedListItemBlock = NotionBlockBase & {
  readonly type: "bulleted_list_item"
  readonly richText: readonly RichText[]
}

export type NumberedListItemBlock = NotionBlockBase & {
  readonly type: "numbered_list_item"
  readonly richText: readonly RichText[]
}

export type QuoteBlock = NotionBlockBase & {
  readonly type: "quote"
  readonly richText: readonly RichText[]
}

export type CodeBlock = NotionBlockBase & {
  readonly type: "code"
  readonly richText: readonly RichText[]
  readonly language: string
}

export type ImageBlock = NotionBlockBase & {
  readonly type: "image"
  readonly mediaId: string
  readonly caption: readonly RichText[]
}

export type LinkToPageBlock = NotionBlockBase & {
  readonly type: "link_to_page"
  readonly pageId: string
}

export type DividerBlock = NotionBlockBase & {
  readonly type: "divider"
}

export type CalloutBlock = NotionBlockBase & {
  readonly type: "callout"
  readonly richText: readonly RichText[]
  readonly icon: string | null
}

export type ToggleBlock = NotionBlockBase & {
  readonly type: "toggle"
  readonly richText: readonly RichText[]
}

export type NotionBlock =
  | ParagraphBlock
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | BulletedListItemBlock
  | NumberedListItemBlock
  | QuoteBlock
  | CodeBlock
  | ImageBlock
  | LinkToPageBlock
  | DividerBlock
  | CalloutBlock
  | ToggleBlock

export type NotionBlockTree = readonly NotionBlock[]
