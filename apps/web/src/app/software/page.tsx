import { PageContainer } from "@/components/PageContainer"
import { SoftwareProjectList } from "@/components/SoftwareProjectList"
import { getPublishedProjects } from "@/db/content"

export const dynamic = "force-dynamic"

export default async function SoftwarePage() {
  const projects = await getPublishedProjects("software")

  return (
    <PageContainer>
      {projects.length > 0 ? (
        <SoftwareProjectList projects={projects} />
      ) : (
        <div className="empty-state">No software projects published yet.</div>
      )}
    </PageContainer>
  )
}
