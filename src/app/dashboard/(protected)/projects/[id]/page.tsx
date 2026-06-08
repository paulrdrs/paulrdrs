import { notFound } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardProject } from "@/db/adminContent"
import { ContentEditor } from "../../_components/ContentEditor"
import { updateProjectAction } from "../actions"

type EditProjectPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditProjectPage({
  params
}: EditProjectPageProps) {
  await requireDashboardSession()

  const { id } = await params
  const project = await getDashboardProject(id)

  if (!project) {
    notFound()
  }

  return (
    <>
      <h2 className="font-black text-2xl">Edit project</h2>
      <ContentEditor
        action={updateProjectAction.bind(null, project.id)}
        content={project}
        kind="project"
        submitLabel="Save project"
      />
    </>
  )
}
