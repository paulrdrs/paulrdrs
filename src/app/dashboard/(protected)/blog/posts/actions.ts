"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { parsePostForm } from "@/cms/contentForms"
import { createDashboardPost, updateDashboardPost } from "@/db/adminContent"

export const createPostAction = async (formData: FormData) => {
  await requireDashboardSession()

  const post = await createDashboardPost(parsePostForm(formData))

  revalidatePath("/dashboard/blog/posts")
  revalidatePath("/blog")
  redirect(`/dashboard/blog/posts/${post.id}`)
}

export const updatePostAction = async (id: string, formData: FormData) => {
  await requireDashboardSession()

  await updateDashboardPost(id, parsePostForm(formData))

  revalidatePath("/dashboard/blog/posts")
  revalidatePath(`/dashboard/blog/posts/${id}`)
  revalidatePath("/blog")
  redirect(`/dashboard/blog/posts/${id}`)
}
