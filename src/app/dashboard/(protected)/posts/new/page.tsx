import { requireDashboardSession } from "@/auth/guards"
import { getDashboardMediaAssets } from "@/db/adminContent"
import { ContentEditor } from "../../_components/ContentEditor"
import { createPostAction } from "../actions"

export default async function NewPostPage() {
  await requireDashboardSession()
  const mediaAssets = await getDashboardMediaAssets()

  return (
    <>
      <h2 className="font-black text-2xl">New post</h2>
      <ContentEditor
        action={createPostAction}
        kind="post"
        mediaAssets={mediaAssets}
        submitLabel="Create post"
      />
    </>
  )
}
