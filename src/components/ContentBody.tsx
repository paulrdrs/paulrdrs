import type { NotionBlockTree } from "@/notion/types"
import { MarkdownContent } from "./MarkdownContent"
import { NotionBlocks } from "./NotionBlocks"

type ContentBodyProps = {
  body: NotionBlockTree | null
  markdown: string
}

// Renders Notion `body` blocks when present, falling back to the legacy Markdown
// renderer. The Markdown arm (and this fallback) are removed in task 7 once
// Notion is the source of truth.
export const ContentBody = ({ body, markdown }: ContentBodyProps) =>
  body && body.length > 0 ? (
    <NotionBlocks blocks={body} />
  ) : (
    <MarkdownContent markdown={markdown} />
  )
