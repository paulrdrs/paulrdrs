import type { NotionBlockTree } from "@/notion/types"
import { NotionBlocks } from "./NotionBlocks"

type ContentBodyProps = {
  body: NotionBlockTree | null
}

// Renders the Notion `body` block tree. Content is authored in Notion and synced
// to D1; there is no Markdown authoring path.
export const ContentBody = ({ body }: ContentBodyProps) =>
  body && body.length > 0 ? <NotionBlocks blocks={body} /> : null
