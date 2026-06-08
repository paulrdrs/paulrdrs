import { trackPageView } from "@/analytics/server"
import { MarkdownContent } from "@/components/MarkdownContent"
import { PageContainer } from "@/components/PageContainer"
import { getPublishedPageByKey } from "@/db/content"

export const dynamic = "force-dynamic"

export default async function ContactPage() {
  const contactPage = await getPublishedPageByKey("contact")
  await trackPageView({
    contentId: contactPage?.id,
    contentType: contactPage ? "page" : null,
    path: "/contact"
  })

  return (
    <PageContainer>
      <h1 className="font-black text-3xl">{contactPage?.title ?? "Contact"}</h1>
      {contactPage ? (
        <MarkdownContent markdown={contactPage.bodyMarkdown} />
      ) : (
        <p className="font-medium">Contact details will live here.</p>
      )}
    </PageContainer>
  )
}
