import "server-only"
import { serverEnvsSchema } from "./schemas"

export const serverEnvs = serverEnvsSchema.parse({
  API_URL: process.env.API_URL || "http://localhost:4000",
  ADMIN_EMAIL_ALLOWLIST: process.env.ADMIN_EMAIL_ALLOWLIST,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
  RAILWAY_STORAGE_ACCESS_KEY_ID: process.env.RAILWAY_STORAGE_ACCESS_KEY_ID,
  RAILWAY_STORAGE_BUCKET: process.env.RAILWAY_STORAGE_BUCKET,
  RAILWAY_STORAGE_ENDPOINT: process.env.RAILWAY_STORAGE_ENDPOINT,
  RAILWAY_STORAGE_REGION: process.env.RAILWAY_STORAGE_REGION,
  RAILWAY_STORAGE_SECRET_ACCESS_KEY:
    process.env.RAILWAY_STORAGE_SECRET_ACCESS_KEY,
  REDIS_URL: process.env.REDIS_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  SITE_URL: process.env.SITE_URL
})
