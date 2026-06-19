"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { parsePageForm } from "@/cms/contentForms"
import { isPageKey, type PageKey } from "@/cms/pages"
import { upsertDashboardPage } from "@/db/adminContent"

const dashboardPagePath = (key: PageKey) =>
  key === "home" ? "/dashboard/home" : "/dashboard/contact"

export const updatePageAction = async (key: string, formData: FormData) => {
  await requireDashboardSession()

  if (!isPageKey(key)) {
    throw new Error("Unknown page key")
  }

  await upsertDashboardPage(key, parsePageForm(formData))

  revalidatePath(dashboardPagePath(key))
  revalidatePath(key === "home" ? "/" : `/${key}`)
  redirect(dashboardPagePath(key))
}
