"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { parsePageForm } from "@/cms/contentForms"
import { isPageKey, type PageKey } from "@/cms/pages"
import { getDashboardPage, upsertDashboardPage } from "@/db/adminContent"
import { getFeaturedHeroContent } from "@/db/content"
import { parseHeroSelectionValue } from "@/site/hero"

const dashboardPagePath = (key: PageKey) =>
  key === "home" ? "/dashboard/home" : "/dashboard/contact"

export const updatePageAction = async (key: string, formData: FormData) => {
  await requireDashboardSession()

  if (!isPageKey(key)) {
    throw new Error("Unknown page key")
  }

  const values = parsePageForm(formData)

  if (key === "home") {
    const selection = parseHeroSelectionValue(
      String(formData.get("heroSelection") ?? "")
    )

    if (selection && !(await getFeaturedHeroContent(selection))) {
      throw new Error("Hero content must be publicly available")
    }

    const currentPage = await getDashboardPage("home")
    await upsertDashboardPage(key, {
      ...values,
      metadata: {
        ...(currentPage?.metadata ?? {}),
        hero: selection
      }
    })
  } else {
    await upsertDashboardPage(key, values)
  }

  revalidatePath(dashboardPagePath(key))
  revalidatePath(key === "home" ? "/" : `/${key}`)
  redirect(dashboardPagePath(key))
}
