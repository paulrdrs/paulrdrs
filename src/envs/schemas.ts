import { z } from "zod"

const emailWithOptionalDisplayNameSchema = z.string().refine((value) => {
  const displayNameEmail = value.match(/<([^<>]+)>$/)
  return z.email().safeParse(displayNameEmail?.[1] ?? value).success
}, "Invalid email address")

export const clientEnvsSchema = z.object({
  AUTH_COOKIE_PREFIX: z.string(),
  AUTH_SELECTED_ACCOUNT_COOKIE_NAME: z.string(),
  API_URL: z.url()
})

export const serverEnvsSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  API_URL: z.url(),
  DATABASE_URL: z.url()
})

export const authEnvsSchema = z.object({
  REDIS_URL: z.url(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: emailWithOptionalDisplayNameSchema,
  ADMIN_EMAIL_ALLOWLIST: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.email()).min(1)),
  SESSION_SECRET: z.string().min(32),
  SITE_URL: z.url()
})

export const storageEnvsSchema = z.object({
  RAILWAY_STORAGE_ENDPOINT: z.url(),
  RAILWAY_STORAGE_BUCKET: z.string().min(1),
  RAILWAY_STORAGE_ACCESS_KEY_ID: z.string().min(1),
  RAILWAY_STORAGE_SECRET_ACCESS_KEY: z.string().min(1),
  RAILWAY_STORAGE_REGION: z.string().min(1)
})
