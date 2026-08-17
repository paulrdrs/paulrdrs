import type { Metadata } from "next"
import { PageContainer } from "@/components/PageContainer"
import { PhotographyProjectSnippet } from "@/components/PhotographyProjectSnippet"
import { PostSnippet } from "@/components/PostSnippet"
import { SoftwareProjectSnippet } from "@/components/SoftwareProjectSnippet"
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

const formatPostDate = (value: Date | string | null) => {
  if (!value) {
    return "Undated"
  }

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime())
    ? "Undated"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)
}

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
      {featuredItems.map((item) => (
        <HomeSnippet item={item} key={`${item.kind}:${item.id}`} />
      ))}
    </PageContainer>
  )
}

const HomeSnippet = ({ item }: { item: FeaturedHomeContentItem }) => {
  if (item.kind === "post") {
    return (
      <PostSnippet
        {...item}
        label={formatPostDate(item.publishedAt)}
        tags={item.tags}
      />
    )
  }

  return item.category === "software" ? (
    <SoftwareProjectSnippet {...item} label="software project" />
  ) : (
    <PhotographyProjectSnippet {...item} label="photography project" />
  )
}
