import type { Metadata } from "next"
import { HomeFeatures } from "@/components/HomeFeatures"
import { PageContainer } from "@/components/PageContainer"
import {
  type FeaturedHomeContentItem,
  getFeaturedHomeContentItem,
  getPublishedPageByKey
} from "@/db/content"
import { getHomeFeaturedSelections } from "@/site/hero"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: { absolute: "paulrdrs" },
  alternates: { canonical: "/" },
  openGraph: {
    title: "paulrdrs",
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

  return (
    <PageContainer>
      <section className="flex flex-col gap-10 pb-12">
        <h1 className="display-title">paulrdrs</h1>
        <HomeFeatures items={featuredItems} />
      </section>
    </PageContainer>
  )
}
