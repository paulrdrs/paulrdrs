import "server-only"
import { notionEnvsSchema, siteEnvsSchema } from "./schemas"

export const getSiteEnvs = () =>
  siteEnvsSchema.parse({
    SITE_URL: process.env.SITE_URL
  })

export const getNotionEnvs = () =>
  notionEnvsSchema.parse({
    JOBS_SECRET: process.env.JOBS_SECRET,
    NOTION_PAGES_DB_ID: process.env.NOTION_PAGES_DB_ID,
    NOTION_PHOTOS_DB_ID: process.env.NOTION_PHOTOS_DB_ID,
    NOTION_POSTS_DB_ID: process.env.NOTION_POSTS_DB_ID,
    NOTION_PROJECTS_DB_ID: process.env.NOTION_PROJECTS_DB_ID,
    NOTION_TOKEN: process.env.NOTION_TOKEN
  })
