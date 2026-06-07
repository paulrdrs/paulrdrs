import Link from "next/link"
import { PageContainer } from "@/components/PageContainer"
import { getPublishedProjects } from "@/db/content"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const projects = await getPublishedProjects()

  return (
    <PageContainer>
      <h1 className="font-black text-3xl">Projects</h1>

      {projects.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {projects.map((project) => (
            <li className="flex flex-col gap-1" key={project.id}>
              <Link
                className="font-black text-xl hover:underline"
                href={`/projects/${project.category}/${project.slug}`}
              >
                {project.title}
              </Link>
              {project.excerpt ? (
                <p className="font-medium">{project.excerpt}</p>
              ) : null}
              <p className="font-mono text-sm uppercase">{project.category}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-medium">No projects published yet.</p>
      )}
    </PageContainer>
  )
}
