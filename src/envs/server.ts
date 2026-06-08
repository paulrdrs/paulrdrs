import "server-only"
import { authEnvsSchema, serverEnvsSchema, storageEnvsSchema } from "./schemas"

export const getServerEnvs = () =>
  serverEnvsSchema.parse({
    API_URL: process.env.API_URL || "http://localhost:4000",
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV || "development"
  })

export const getAuthEnvs = () =>
  authEnvsSchema.parse({
    ADMIN_EMAIL_ALLOWLIST: process.env.ADMIN_EMAIL_ALLOWLIST,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    SITE_URL: process.env.SITE_URL
  })

export const getStorageEnvs = () =>
  storageEnvsSchema.parse({
    STORAGE_ACCESS_KEY_ID: process.env.STORAGE_ACCESS_KEY_ID,
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
    STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT,
    STORAGE_REGION: process.env.STORAGE_REGION,
    STORAGE_SECRET_ACCESS_KEY: process.env.STORAGE_SECRET_ACCESS_KEY
  })
