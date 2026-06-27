import type { Metadata } from "next"
import { trackPageView } from "@/analytics/server"
import { ContentBody } from "@/components/ContentBody"
import { PageContainer } from "@/components/PageContainer"
import { getPublishedPageByKey } from "@/db/content"
import { blockTreeToPlainText, createExcerpt } from "@/lib/content"
import { buildContentMetadata } from "@/lib/metadata"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const contactPage = await getPublishedPageByKey("contact")
  const description = contactPage?.body
    ? blockTreeToPlainText(contactPage.body)
    : contactPage?.bodyMarkdown
      ? createExcerpt(contactPage.bodyMarkdown)
      : undefined

  return buildContentMetadata({
    description,
    path: "/contact",
    title: contactPage?.title ?? "Contact",
    type: "website"
  })
}

export default async function ContactPage() {
  const contactPage = await getPublishedPageByKey("contact")
  await trackPageView({
    contentId: contactPage?.id,
    contentType: contactPage ? "page" : null,
    path: "/contact"
  })

  return (
    <PageContainer>
      <header className="pb-2">
        <h1 className="page-title">{contactPage?.title ?? "Contact"}</h1>
      </header>
      {contactPage ? (
        <div>
          <ContentBody
            body={contactPage.body}
            markdown={contactPage.bodyMarkdown}
          />
        </div>
      ) : (
        <div className="empty-state">Contact details will live here.</div>
      )}
    </PageContainer>
  )
}
