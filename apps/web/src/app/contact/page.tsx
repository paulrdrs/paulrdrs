import type { Metadata } from "next"
import { ContentBody } from "@/components/ContentBody"
import { PageContainer } from "@/components/PageContainer"
import { getPublishedPageByKey } from "@/db/content"
import { blockTreeToPlainText } from "@/lib/content"
import { buildContentMetadata } from "@/lib/metadata"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const contactPage = await getPublishedPageByKey("contact")
  const description = contactPage?.body
    ? blockTreeToPlainText(contactPage.body)
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

  return (
    <PageContainer>
      <header className="p-4">
        <h1 className="text-balance font-bold text-4xl">
          {contactPage?.title ?? "Contact"}
        </h1>
      </header>
      {contactPage ? (
        <div className="px-4">
          <ContentBody body={contactPage.body} />
        </div>
      ) : (
        <div className="empty-state px-4">Contact details will live here.</div>
      )}
    </PageContainer>
  )
}
