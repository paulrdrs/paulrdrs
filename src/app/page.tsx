import type { Metadata } from "next"
import { trackPageView } from "@/analytics/server"
import { Hero } from "@/components/Hero"
import { MarkdownContent } from "@/components/MarkdownContent"
import { PageContainer } from "@/components/PageContainer"
import { getFeaturedHeroContent, getPublishedPageByKey } from "@/db/content"
import { createExcerpt } from "@/lib/content"
import { getHeroSelection } from "@/site/hero"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const homePage = await getPublishedPageByKey("home")
  const description = homePage?.bodyMarkdown
    ? createExcerpt(homePage.bodyMarkdown)
    : undefined

  return {
    title: { absolute: homePage?.title ?? "paulrdrs" },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title: homePage?.title ?? "paulrdrs",
      description,
      type: "website",
      url: "/"
    }
  }
}

export default async function Home() {
  const homePage = await getPublishedPageByKey("home")
  const selection = getHeroSelection(homePage?.metadata)
  const featured = selection
    ? await getFeaturedHeroContent(selection)
    : undefined
  await trackPageView({
    contentId: homePage?.id,
    contentType: homePage ? "page" : null,
    path: "/"
  })

  return (
    <PageContainer>
      <Hero
        featured={featured}
        introMarkdown={featured ? undefined : homePage?.bodyMarkdown}
        title={homePage?.title ?? "paulrdrs"}
      />
      {featured && homePage ? (
        <section className="grid gap-8 py-8 lg:grid-cols-12">
          <h2 className="section-title lg:col-span-4">{homePage.title}</h2>
          <div className="lg:col-span-7 lg:col-start-6">
            <MarkdownContent markdown={homePage.bodyMarkdown} />
          </div>
        </section>
      ) : null}
    </PageContainer>
  )
}
