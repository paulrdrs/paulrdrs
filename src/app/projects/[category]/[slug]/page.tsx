import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { trackPageView } from "@/analytics/server"
import { ContentBody } from "@/components/ContentBody"
import { ContentImage } from "@/components/ContentImage"
import { PageContainer } from "@/components/PageContainer"
import {
  getProjectSlugByPreviousSlug,
  getPublishedProjectBySlug
} from "@/db/content"
import { isProjectCategory } from "@/db/contentTypes"
import { blockTreeToPlainText } from "@/lib/content"
import { buildContentMetadata } from "@/lib/metadata"

export const dynamic = "force-dynamic"

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

  await trackPageView({
    contentId: project.id,
    contentType: "project",
    path: `/projects/${project.category}/${project.slug}`
  })

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
          className="aspect-video"
          id={project.coverMediaId}
          priority
        />
      ) : null}
      <div>
        <ContentBody body={project.body} />
      </div>
    </PageContainer>
  )
}
