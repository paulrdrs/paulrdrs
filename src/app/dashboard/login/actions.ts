"use server"

import { redirect } from "next/navigation"
import { requestMagicLink } from "@/auth/magicLink"
import { getAuthEnvs } from "@/envs/server"

export const requestMagicLinkAction = async (formData: FormData) => {
  const authEnvs = getAuthEnvs()
  const email = String(formData.get("email") ?? "")

  await requestMagicLink({
    allowlist: authEnvs.ADMIN_EMAIL_ALLOWLIST,
    email,
    resendApiKey: authEnvs.RESEND_API_KEY,
    resendFromEmail: authEnvs.RESEND_FROM_EMAIL,
    siteUrl: authEnvs.SITE_URL
  })

  redirect("/dashboard/login?sent=1")
}
