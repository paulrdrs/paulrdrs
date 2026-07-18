import { isProjectCategory } from "@paulrdrs/content/content"
import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { ContentBody } from "@/components/ContentBody"
import { ContentImage } from "@/components/ContentImage"
import { PageContainer } from "@/components/PageContainer"
import { PhotoGrid } from "@/components/PhotoGrid"
import {
  getProjectSlugByPreviousSlug,
  getPublishedProjectBySlug,
  getPublishedProjectPhotos
} from "@/db/content"
import { blockTreeToPlainText } from "@/lib/content"
import { buildContentMetadata } from "@/lib/metadata"

export const revalidate = 300

// Empty params so nothing prerenders at build (D1 is unavailable there); pages
// render on the first request and are then cached (ISR).
export function generateStaticParams() {
  return []
}

type ProjectPageProps = {
  params: Promise<{
    category: string
    slug: string
  }>
}

export async function generateMetadata({
  params
}: ProjectPageProps): Promise<Metadata> {
  const { category, slug } = await params

  if (!isProjectCategory(category)) {
    return {}
  }

  const project = await getPublishedProjectBySlug(category, slug)

  if (!project) {
    return {}
  }

  return buildContentMetadata({
    coverMediaId: project.coverMediaId,
    description:
      project.seoDescription ??
      project.excerpt ??
      (project.body ? blockTreeToPlainText(project.body) : null),
    path: `/projects/${project.category}/${project.slug}`,
    title: project.seoTitle ?? project.title
  })
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { category, slug } = await params

  if (!isProjectCategory(category)) {
    notFound()
  }

  const project = await getPublishedProjectBySlug(category, slug)

  if (!project) {
    const currentSlug = await getProjectSlugByPreviousSlug(category, slug)
    if (currentSlug) {
      permanentRedirect(`/projects/${category}/${currentSlug}`)
    }
    notFound()
  }

  // Photography projects double as albums: show the photos linked to them.
  const photos =
    project.category === "photography"
      ? await getPublishedProjectPhotos(project.id)
      : []

  return (
    <PageContainer>
      <header className="grid gap-8 pb-2 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-10">
          <p className="eyebrow">Project · {project.category}</p>
          <h1 className="page-title">{project.title}</h1>
          {project.excerpt ? (
            <p className="max-w-2xl text-muted text-xl">{project.excerpt}</p>
          ) : null}
        </div>
      </header>
      {project.coverMediaId ? (
        <ContentImage
          alt={project.coverAltText}
          attribution={project.coverAttribution}
          id={project.coverMediaId}
          presentation="wide"
          priority
        />
      ) : null}
      <div>
        <ContentBody body={project.body} />
      </div>
      {photos.length > 0 ? <PhotoGrid photos={photos} /> : null}
    </PageContainer>
  )
}
