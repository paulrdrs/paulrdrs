import type { Metadata } from "next"
import { FeaturedSnippet } from "@/components/FeaturedSnippet"
import { PageContainer } from "@/components/PageContainer"
import {
  type FeaturedHomeContentItem,
  getFeaturedHomeContentItem,
  getPublishedPageByKey
} from "@/db/content"
import { getHomeFeaturedSelections } from "@/site/hero"

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

const isFeaturedItem = (
  item: FeaturedHomeContentItem | undefined
): item is FeaturedHomeContentItem => item !== undefined

export default async function Home() {
  const homePage = await getPublishedPageByKey("home")
  const selections = getHomeFeaturedSelections(homePage?.metadata)
  const featuredItems = (
    await Promise.all(selections.map(getFeaturedHomeContentItem))
  ).filter(isFeaturedItem)

  if (featuredItems.length === 0) {
    return (
      <PageContainer>
        <span>{"nothing to see here"}</span>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {featuredItems.map((item, index) => (
        <FeaturedSnippet
          {...item}
          featuredPosition={index + 1}
          priority={index === 0}
          key={`${item.kind}:${item.id}`}
        />
      ))}
    </PageContainer>
  )
}
