"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { parsePageForm } from "@/cms/contentForms"
import { isPageKey } from "@/cms/pages"
import { upsertDashboardPage } from "@/db/adminContent"

export const updatePageAction = async (key: string, formData: FormData) => {
  await requireDashboardSession()

  if (!isPageKey(key)) {
    throw new Error("Unknown page key")
  }

  await upsertDashboardPage(key, parsePageForm(formData))

  revalidatePath("/dashboard/pages")
  revalidatePath(`/dashboard/pages/${key}`)
  revalidatePath(key === "home" ? "/" : `/${key}`)
  redirect(`/dashboard/pages/${key}`)
}
