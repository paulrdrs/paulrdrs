import "server-only"
import {
  analyticsEnvsSchema,
  authEnvsSchema,
  serverEnvsSchema,
  siteEnvsSchema,
  storageEnvsSchema
} from "./schemas"

export const getAnalyticsEnvs = () =>
  analyticsEnvsSchema.parse({
    ANALYTICS_SALT: process.env.ANALYTICS_SALT
  })

export const getServerEnvs = () =>
  serverEnvsSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV || "development"
  })

export const getSiteEnvs = () =>
  siteEnvsSchema.parse({
    SITE_URL: process.env.SITE_URL
  })

export const getAuthEnvs = () =>
  authEnvsSchema.parse({
    ADMIN_EMAIL_ALLOWLIST: process.env.ADMIN_EMAIL_ALLOWLIST,
    PASSKEY_BOOTSTRAP_SECRET: process.env.PASSKEY_BOOTSTRAP_SECRET,
    PASSKEY_RP_ID: process.env.PASSKEY_RP_ID,
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
