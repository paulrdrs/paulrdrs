"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { upsertSiteNavigationSettings } from "@/db/siteSettings"
import { parseSiteNavigationSettingsForm } from "@/site/navigation"

export const updateSiteNavigationSettingsAction = async (
  formData: FormData
) => {
  await requireDashboardSession()

  await upsertSiteNavigationSettings(parseSiteNavigationSettingsForm(formData))

  revalidatePath("/", "layout")
  revalidatePath("/dashboard/settings")
  redirect("/dashboard/settings")
}
