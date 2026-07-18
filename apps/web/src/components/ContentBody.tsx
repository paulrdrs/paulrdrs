import type { NotionBlockTree } from "@paulrdrs/content/blocks"
import { NotionBlocks } from "./NotionBlocks"

type ContentBodyProps = {
  body: NotionBlockTree | null
}

export const ContentBody = ({ body }: ContentBodyProps) =>
  body && body.length > 0 ? <NotionBlocks blocks={body} /> : null
