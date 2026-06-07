import { clientEnvsSchema } from "./schemas"

export const clientEnvs = clientEnvsSchema.parse({
  AUTH_COOKIE_PREFIX: process.env.NEXT_PUBLIC_AUTH_COOKIE_PREFIX,
  AUTH_SELECTED_ACCOUNT_COOKIE_NAME:
    process.env.NEXT_PUBLIC_AUTH_SELECTED_ACCOUNT_COOKIE_NAME,
  API_URL: process.env.NEXT_PUBLIC_API_URL
})
