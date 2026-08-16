import { PageContainer } from "@/components/PageContainer"
import { PhotographyProjectList } from "@/components/PhotographyProjectList"
import { getPublishedProjects } from "@/db/content"

export const dynamic = "force-dynamic"

export default async function PhotographyPage() {
  const projects = await getPublishedProjects("photography")

  return (
    <PageContainer>
      {projects.length > 0 ? (
        <PhotographyProjectList projects={projects} />
      ) : (
        <div className="empty-state">
          No photography projects published yet.
        </div>
      )}
    </PageContainer>
  )
}
