import { sendMagicLinkEmail } from "./email"
import {
  createMagicLinkToken,
  isAllowedAdminEmail,
  normalizeEmail
} from "./tokens"

type RequestMagicLinkInput = {
  email: string
  allowlist: string[]
  resendApiKey: string
  resendFromEmail: string
  siteUrl: string
}

export const createMagicLinkUrl = (siteUrl: string, token: string) => {
  const url = new URL("/dashboard/auth/callback", siteUrl)
  url.searchParams.set("token", token)
  return url.toString()
}

export const requestMagicLink = async ({
  email,
  allowlist,
  resendApiKey,
  resendFromEmail,
  siteUrl
}: RequestMagicLinkInput) => {
  if (!isAllowedAdminEmail(email, allowlist)) {
    return
  }

  const normalizedEmail = normalizeEmail(email)
  const token = await createMagicLinkToken(normalizedEmail)

  await sendMagicLinkEmail({
    apiKey: resendApiKey,
    from: resendFromEmail,
    loginUrl: createMagicLinkUrl(siteUrl, token),
    to: normalizedEmail
  })
}
