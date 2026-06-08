import { trackPageView } from "@/analytics/server"
import { Hero } from "@/components/Hero"
import { MarkdownContent } from "@/components/MarkdownContent"
import { PageContainer } from "@/components/PageContainer"
import { getPublishedPageByKey } from "@/db/content"

export const dynamic = "force-dynamic"

export default async function Home() {
  const homePage = await getPublishedPageByKey("home")
  await trackPageView({
    contentId: homePage?.id,
    contentType: homePage ? "page" : null,
    path: "/"
  })

  return (
    <>
      <Hero />
      <PageContainer>
        {homePage ? (
          <>
            <h1 className="font-black text-3xl">{homePage.title}</h1>
            <MarkdownContent markdown={homePage.bodyMarkdown} />
          </>
        ) : (
          <p>{"paulrdrs"}</p>
        )}
      </PageContainer>
    </>
  )
}
