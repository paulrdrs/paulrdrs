"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { parseProjectForm } from "@/cms/contentForms"
import {
  createDashboardProject,
  updateDashboardProject
} from "@/db/adminContent"

export const createProjectAction = async (formData: FormData) => {
  await requireDashboardSession()

  const project = await createDashboardProject(parseProjectForm(formData))

  revalidatePath("/dashboard/projects")
  revalidatePath("/projects")
  redirect(`/dashboard/projects/${project.id}`)
}

export const updateProjectAction = async (id: string, formData: FormData) => {
  await requireDashboardSession()

  await updateDashboardProject(id, parseProjectForm(formData))

  revalidatePath("/dashboard/projects")
  revalidatePath(`/dashboard/projects/${id}`)
  revalidatePath("/projects")
  redirect(`/dashboard/projects/${id}`)
}
