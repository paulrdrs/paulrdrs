import { PageContainer } from "@/components/PageContainer"
import { ProjectList } from "@/components/ProjectList"
import { getPublishedProjects } from "@/db/content"

export const dynamic = "force-dynamic"

export default async function SoftwarePage() {
  const projects = await getPublishedProjects("software")

  return (
    <PageContainer>
      <header className="pb-2">
        <h1 className="page-title">Software</h1>
      </header>

      {projects.length > 0 ? (
        <ProjectList projects={projects} />
      ) : (
        <div className="empty-state">No software projects published yet.</div>
      )}
    </PageContainer>
  )
}
