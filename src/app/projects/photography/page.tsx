import { trackPageView } from "@/analytics/server"
import { PageContainer } from "@/components/PageContainer"
import { ProjectGrid } from "@/components/ProjectGrid"
import { getPublishedProjects } from "@/db/content"

export const dynamic = "force-dynamic"

export default async function PhotographyProjectsPage() {
  const projects = await getPublishedProjects("photography")
  await trackPageView({ contentType: "page", path: "/projects/photography" })

  return (
    <PageContainer>
      <header className="pb-2">
        <div>
          <p className="eyebrow mb-4">Projects</p>
          <h1 className="page-title">Photography</h1>
        </div>
      </header>

      {projects.length > 0 ? (
        <ProjectGrid projects={projects} />
      ) : (
        <div className="empty-state">
          No photography projects published yet.
        </div>
      )}
    </PageContainer>
  )
}
