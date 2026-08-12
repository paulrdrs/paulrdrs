import { PageContainer } from "@/components/PageContainer"
import { ProjectList } from "@/components/ProjectList"
import { getPublishedProjects } from "@/db/content"

export const dynamic = "force-dynamic"

export default async function PhotographyPage() {
  const projects = await getPublishedProjects("photography")

  return (
    <PageContainer>
      <header>
        <h1 className="page-title">Photography</h1>
      </header>

      {projects.length > 0 ? (
        <ProjectList projects={projects} />
      ) : (
        <div className="empty-state">
          No photography projects published yet.
        </div>
      )}
    </PageContainer>
  )
}
