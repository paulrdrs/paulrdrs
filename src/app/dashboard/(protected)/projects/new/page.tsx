import { requireDashboardSession } from "@/auth/guards"
import { ContentEditor } from "../../_components/ContentEditor"
import { createProjectAction } from "../actions"

export default async function NewProjectPage() {
  await requireDashboardSession()

  return (
    <>
      <h2 className="font-black text-2xl">New project</h2>
      <ContentEditor
        action={createProjectAction}
        kind="project"
        submitLabel="Create project"
      />
    </>
  )
}
