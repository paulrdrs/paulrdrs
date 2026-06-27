import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { trackPageView } from "@/analytics/server"
import { ContentImage } from "@/components/ContentImage"
import { MarkdownContent } from "@/components/MarkdownContent"
import { PageContainer } from "@/components/PageContainer"
import { getPublishedProjectBySlug } from "@/db/content"
import { isProjectCategory } from "@/db/contentTypes"
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
    description: project.seoDescription ?? project.excerpt,
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
        <MarkdownContent markdown={project.bodyMarkdown} />
      </div>
      {project.links.length > 0 ? (
        <ul className="flex flex-wrap gap-4 pt-2">
          {project.links.map((link) => (
            <li key={link.url}>
              <a className="button" href={link.url}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </PageContainer>
  )
}
