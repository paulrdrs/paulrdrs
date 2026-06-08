import Link from "next/link"
import { trackPageView } from "@/analytics/server"
import { PageContainer } from "@/components/PageContainer"
import { getPublishedProjects } from "@/db/content"

export const dynamic = "force-dynamic"

export default async function PhotographyProjectsPage() {
  const projects = await getPublishedProjects("photography")
  await trackPageView({ contentType: "page", path: "/projects/photography" })

  return (
    <PageContainer>
      <h1 className="font-black text-3xl">Photography</h1>

      {projects.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {projects.map((project) => (
            <li className="flex flex-col gap-1" key={project.id}>
              <Link
                className="font-black text-xl hover:underline"
                href={`/projects/photography/${project.slug}`}
              >
                {project.title}
              </Link>
              {project.excerpt ? (
                <p className="font-medium">{project.excerpt}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-medium">No photography projects published yet.</p>
      )}
    </PageContainer>
  )
}
