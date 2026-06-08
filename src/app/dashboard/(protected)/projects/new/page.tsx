import { requireDashboardSession } from "@/auth/guards"
import { getDashboardMediaAssets } from "@/db/adminContent"
import { ContentEditor } from "../../_components/ContentEditor"
import { createProjectAction } from "../actions"

export default async function NewProjectPage() {
  await requireDashboardSession()
  const mediaAssets = await getDashboardMediaAssets()

  return (
    <>
      <h2 className="font-black text-2xl">New project</h2>
      <ContentEditor
        action={createProjectAction}
        kind="project"
        mediaAssets={mediaAssets}
        submitLabel="Create project"
      />
    </>
  )
}
