import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { ContentBody } from "@/components/ContentBody"
import { ContentImage } from "@/components/ContentImage"
import { PageContainer } from "@/components/PageContainer"
import { PhotoList } from "@/components/PhotoList"
import {
  getProjectSlugByPreviousSlug,
  getPublishedProjectBySlug,
  getPublishedProjectPhotos
} from "@/db/content"
import { blockTreeToPlainText } from "@/lib/content"
import { buildContentMetadata } from "@/lib/metadata"

export const revalidate = 300

export function generateStaticParams() {
  return []
}

type PhotographyProjectPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params
}: PhotographyProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getPublishedProjectBySlug("photography", slug)

  if (!project) {
    return {}
  }

  return buildContentMetadata({
    coverMediaId: project.coverMediaId,
    description:
      project.seoDescription ??
      project.excerpt ??
      (project.body ? blockTreeToPlainText(project.body) : null),
    path: `/photography/${project.slug}`,
    title: project.seoTitle ?? project.title
  })
}

export default async function PhotographyProjectPage({
  params
}: PhotographyProjectPageProps) {
  const { slug } = await params
  const project = await getPublishedProjectBySlug("photography", slug)

  if (!project) {
    const currentSlug = await getProjectSlugByPreviousSlug("photography", slug)
    if (currentSlug) {
      permanentRedirect(`/photography/${currentSlug}`)
    }
    notFound()
  }

  const photos = await getPublishedProjectPhotos(project.id)

  return (
    <PageContainer>
      <header className="flex flex-col gap-2 p-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-balance font-bold text-4xl">{project.title}</h1>
          {project.excerpt ? (
            <p className="text-lg text-muted leading-6">{project.excerpt}</p>
          ) : null}
        </div>
        {project.coverMediaId ? (
          <ContentImage
            alt={project.coverAltText}
            attribution={project.coverAttribution}
            id={project.coverMediaId}
            presentation="wide"
            priority
          />
        ) : null}
      </header>
      <div className="px-4">
        <ContentBody body={project.body} />
      </div>
      {photos.length > 0 ? <PhotoList photos={photos} /> : null}
    </PageContainer>
  )
}
