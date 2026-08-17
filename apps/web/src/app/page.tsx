import type { LinkToPageBlock, NotionBlockTree } from "@paulrdrs/content/blocks"
import type { Metadata } from "next"
import { HomeContent } from "@/components/HomeContent"
import { PageContainer } from "@/components/PageContainer"
import {
  type FeaturedHomeContentItem,
  getPublishedHomeLinkedContentItem,
  getPublishedPageByKey
} from "@/db/content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: { absolute: "paulrdrs.com" },
  alternates: { canonical: "/" },
  openGraph: {
    title: "paulrdrs.com",
    type: "website",
    url: "/"
  }
}

const collectLinkToPageBlocks = (blocks: NotionBlockTree): LinkToPageBlock[] =>
  blocks.flatMap((block) => [
    ...(block.type === "link_to_page" ? [block] : []),
    ...collectLinkToPageBlocks(block.children)
  ])

export default async function Home() {
  const homePage = await getPublishedPageByKey("home")

  if (!homePage?.body || homePage.body.length === 0) {
    return (
      <PageContainer>
        <span>{"nothing to see here"}</span>
      </PageContainer>
    )
  }

  const linkedBlocks = collectLinkToPageBlocks(homePage.body)
  const linkedItems = await Promise.all(
    linkedBlocks.map(async (block, index) => ({
      blockId: block.id,
      item: await getPublishedHomeLinkedContentItem(block.pageId),
      position: index + 1
    }))
  )
  const featuredItems = new Map<
    string,
    {
      readonly item: FeaturedHomeContentItem
      readonly position: number
    }
  >()

  for (const linkedItem of linkedItems) {
    if (linkedItem.item) {
      featuredItems.set(linkedItem.blockId, {
        item: linkedItem.item,
        position: linkedItem.position
      })
    }
  }

  return (
    <PageContainer>
      <HomeContent body={homePage.body} featuredItems={featuredItems} />
    </PageContainer>
  )
}
