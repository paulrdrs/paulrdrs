import "server-only"
import {
  analyticsEnvsSchema,
  notionEnvsSchema,
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

export const getStorageEnvs = () =>
  storageEnvsSchema.parse({
    STORAGE_ACCESS_KEY_ID: process.env.STORAGE_ACCESS_KEY_ID,
    STORAGE_BUCKET: process.env.STORAGE_BUCKET,
    STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT,
    STORAGE_REGION: process.env.STORAGE_REGION,
    STORAGE_SECRET_ACCESS_KEY: process.env.STORAGE_SECRET_ACCESS_KEY
  })

export const getNotionEnvs = () =>
  notionEnvsSchema.parse({
    JOBS_SECRET: process.env.JOBS_SECRET,
    NOTION_PAGES_DB_ID: process.env.NOTION_PAGES_DB_ID,
    NOTION_POSTS_DB_ID: process.env.NOTION_POSTS_DB_ID,
    NOTION_PROJECTS_DB_ID: process.env.NOTION_PROJECTS_DB_ID,
    NOTION_TOKEN: process.env.NOTION_TOKEN
  })
