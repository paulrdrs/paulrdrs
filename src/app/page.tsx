import type { Metadata } from "next"
import { ContentBody } from "@/components/ContentBody"
import { Hero } from "@/components/Hero"
import { PageContainer } from "@/components/PageContainer"
import { getFeaturedHeroContent, getPublishedPageByKey } from "@/db/content"
import { blockTreeToPlainText } from "@/lib/content"
import { getHeroSelection } from "@/site/hero"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const homePage = await getPublishedPageByKey("home")
  const description = homePage?.body
    ? blockTreeToPlainText(homePage.body)
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

  const hasBody = (homePage?.body?.length ?? 0) > 0
  const bodyContent = homePage ? <ContentBody body={homePage.body} /> : null

  return (
    <PageContainer>
      <Hero
        featured={featured}
        intro={featured || !hasBody ? undefined : bodyContent}
        title={homePage?.title ?? "paulrdrs"}
      />
      {featured && homePage ? (
        <section className="grid gap-8 py-8 lg:grid-cols-12">
          <h2 className="section-title lg:col-span-4">{homePage.title}</h2>
          <div className="lg:col-span-7 lg:col-start-6">{bodyContent}</div>
        </section>
      ) : null}
    </PageContainer>
  )
}
