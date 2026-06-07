import { z } from "zod"

export const clientEnvsSchema = z.object({
  AUTH_COOKIE_PREFIX: z.string(),
  AUTH_SELECTED_ACCOUNT_COOKIE_NAME: z.string(),
  API_URL: z.url()
})

export const serverEnvsSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  API_URL: z.url(),
  AUTH_SECRET_KEY: z.string()
})
