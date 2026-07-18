import { Client } from "@notionhq/client"
import * as schema from "@paulrdrs/database/schema"
import { drizzle } from "drizzle-orm/d1"
import { z } from "zod"

const syncEnvironmentSchema = z.object({
  BUCKET: z.custom<R2Bucket>((value) => value !== null && value !== undefined),
  DB: z.custom<D1Database>((value) => value !== null && value !== undefined),
  NOTION_PAGES_DB_ID: z.string().min(1),
  NOTION_PHOTOS_DB_ID: z.string().min(1),
  NOTION_POSTS_DB_ID: z.string().min(1),
  NOTION_PROJECTS_DB_ID: z.string().min(1),
  NOTION_TOKEN: z.string().min(1)
})

export type NotionSyncEnvironment = z.input<typeof syncEnvironmentSchema>

export type NotionSyncRuntime = {
  readonly bucket: R2Bucket
  readonly databaseIds: {
    readonly pages: string
    readonly photos: string
    readonly posts: string
    readonly projects: string
  }
  readonly db: ReturnType<typeof drizzle<typeof schema>>
  readonly notion: Client
}

export const createNotionSyncRuntime = (
  environment: NotionSyncEnvironment
): NotionSyncRuntime => {
  const validatedEnvironment = syncEnvironmentSchema.parse(environment)

  return {
    bucket: validatedEnvironment.BUCKET,
    databaseIds: {
      pages: validatedEnvironment.NOTION_PAGES_DB_ID,
      photos: validatedEnvironment.NOTION_PHOTOS_DB_ID,
      posts: validatedEnvironment.NOTION_POSTS_DB_ID,
      projects: validatedEnvironment.NOTION_PROJECTS_DB_ID
    },
    db: drizzle(validatedEnvironment.DB, { schema }),
    notion: new Client({ auth: validatedEnvironment.NOTION_TOKEN })
  }
}
