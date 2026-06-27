import { notFound } from "next/navigation"
import { trackPageView } from "@/analytics/server"
import { ContentImage } from "@/components/ContentImage"
import { PageContainer } from "@/components/PageContainer"
import { getPublicMediaAsset } from "@/db/content"

export const dynamic = "force-dynamic"

type PhotoPageProps = {
  params: Promise<{ id: string }>
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { id } = await params
  const media = await getPublicMediaAsset(id)

  if (!media) {
    notFound()
  }

  await trackPageView({ contentType: "page", path: `/photo/${media.id}` })

  return (
    <PageContainer>
      <header className="flex flex-col gap-4 pb-4">
        <p className="eyebrow">Photograph</p>
        <h1 className="page-title">{media.altText || media.filename}</h1>
      </header>
      <ContentImage
        alt={media.altText}
        attribution={media.attribution}
        className="aspect-auto min-h-96"
        id={media.id}
        priority
      />
    </PageContainer>
  )
}
