import { z } from "zod"

export const siteEnvsSchema = z.object({
  SITE_URL: z.url()
})

export const notionEnvsSchema = z.object({
  NOTION_TOKEN: z.string().min(1),
  NOTION_POSTS_DB_ID: z.string().min(1),
  NOTION_PROJECTS_DB_ID: z.string().min(1),
  NOTION_PAGES_DB_ID: z.string().min(1),
  NOTION_PHOTOS_DB_ID: z.string().min(1),
  JOBS_SECRET: z.string().min(32)
})
