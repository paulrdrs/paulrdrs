import { notFound } from "next/navigation"
import { trackPageView } from "@/analytics/server"
import { MarkdownContent } from "@/components/MarkdownContent"
import { PageContainer } from "@/components/PageContainer"
import { getPublishedProjectBySlug } from "@/db/content"
import { isProjectCategory } from "@/db/contentTypes"

export const dynamic = "force-dynamic"

type ProjectPageProps = {
  params: Promise<{
    category: string
    slug: string
  }>
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
      <p className="font-mono text-sm uppercase">{project.category}</p>
      <h1 className="font-black text-3xl">{project.title}</h1>
      {project.excerpt ? (
        <p className="font-medium">{project.excerpt}</p>
      ) : null}
      <MarkdownContent markdown={project.bodyMarkdown} />
      {project.links.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {project.links.map((link) => (
            <li key={link.url}>
              <a className="font-medium underline" href={link.url}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </PageContainer>
  )
}
