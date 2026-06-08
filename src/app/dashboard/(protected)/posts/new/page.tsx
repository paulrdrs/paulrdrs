import { requireDashboardSession } from "@/auth/guards"
import { ContentEditor } from "../../_components/ContentEditor"
import { createPostAction } from "../actions"

export default async function NewPostPage() {
  await requireDashboardSession()

  return (
    <>
      <h2 className="font-black text-2xl">New post</h2>
      <ContentEditor
        action={createPostAction}
        kind="post"
        submitLabel="Create post"
      />
    </>
  )
}
