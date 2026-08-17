import type { LinkToPageBlock, NotionBlockTree } from "@paulrdrs/content/blocks"
import type { FeaturedHomeContentItem } from "@/db/content"
import { FeaturedSnippet } from "./FeaturedSnippet"
import { NotionBlocks } from "./NotionBlocks"

type HomeFeaturedItem = {
  readonly item: FeaturedHomeContentItem
  readonly position: number
}

type HomeContentProps = {
  readonly body: NotionBlockTree
  readonly featuredItems: ReadonlyMap<string, HomeFeaturedItem>
}

export const HomeContent = ({ body, featuredItems }: HomeContentProps) => {
  const renderLinkToPage = (block: LinkToPageBlock) => {
    const featuredItem = featuredItems.get(block.id)

    return featuredItem ? (
      <FeaturedSnippet
        {...featuredItem.item}
        featuredPosition={featuredItem.position}
        key={block.id}
        priority={featuredItem.position === 1}
      />
    ) : null
  }

  return <NotionBlocks blocks={body} renderLinkToPage={renderLinkToPage} />
}
