import { notFound } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardMediaAssets, getDashboardPost } from "@/db/adminContent"
import { ContentEditor } from "../../_components/ContentEditor"
import { updatePostAction } from "../actions"

type EditPostPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  await requireDashboardSession()

  const { id } = await params
  const [post, mediaAssets] = await Promise.all([
    getDashboardPost(id),
    getDashboardMediaAssets()
  ])

  if (!post) {
    notFound()
  }

  return (
    <>
      <h2 className="font-black text-2xl">Edit post</h2>
      <ContentEditor
        action={updatePostAction.bind(null, post.id)}
        content={post}
        kind="post"
        mediaAssets={mediaAssets}
        submitLabel="Save post"
      />
    </>
  )
}
