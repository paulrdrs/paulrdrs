import { PageContainer } from "@/components/PageContainer"
import { ProjectGrid } from "@/components/ProjectGrid"
import { getPublishedProjects } from "@/db/content"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const projects = await getPublishedProjects()

  return (
    <PageContainer>
      <header className="pb-2">
        <h1 className="page-title">Projects</h1>
      </header>

      {projects.length > 0 ? (
        <ProjectGrid projects={projects} />
      ) : (
        <div className="empty-state">No projects published yet.</div>
      )}
    </PageContainer>
  )
}
