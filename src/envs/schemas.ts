import { z } from "zod"

export const clientEnvsSchema = z.object({
  AUTH_COOKIE_PREFIX: z.string(),
  AUTH_SELECTED_ACCOUNT_COOKIE_NAME: z.string()
})

export const serverEnvsSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.url()
})

export const authEnvsSchema = z.object({
  ADMIN_EMAIL_ALLOWLIST: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.email()).min(1)),
  PASSKEY_BOOTSTRAP_SECRET: z.string().min(32),
  PASSKEY_RP_ID: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(32),
  SITE_URL: z.url()
})

export const storageEnvsSchema = z.object({
  STORAGE_ENDPOINT: z.url(),
  STORAGE_BUCKET: z.string().min(1),
  STORAGE_ACCESS_KEY_ID: z.string().min(1),
  STORAGE_SECRET_ACCESS_KEY: z.string().min(1),
  STORAGE_REGION: z.string().min(1)
})
