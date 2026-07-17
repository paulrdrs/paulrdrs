import { S3Client } from "@aws-sdk/client-s3"
import { Client } from "@notionhq/client"
import {
  createDatabaseConnection,
  type DatabaseClient
} from "@paulrdrs/database/client"
import { z } from "zod"

const syncEnvironmentSchema = z.object({
  BUCKET_ACCESS_KEY_ID: z.string().min(1),
  BUCKET_ENDPOINT: z.url(),
  BUCKET_NAME: z.string().min(1),
  BUCKET_SECRET_ACCESS_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  NOTION_PAGES_DB_ID: z.string().min(1),
  NOTION_PHOTOGRAPHY_PROJECTS_DB_ID: z.string().min(1),
  NOTION_PHOTOS_DB_ID: z.string().min(1),
  NOTION_POSTS_DB_ID: z.string().min(1),
  NOTION_SOFTWARE_PROJECTS_DB_ID: z.string().min(1),
  NOTION_TOKEN: z.string().min(1)
})

export type NotionSyncEnvironment = z.input<typeof syncEnvironmentSchema>

export type NotionSyncRuntime = {
  readonly bucket: S3Client
  readonly bucketName: string
  readonly close: () => Promise<void>
  readonly databaseIds: {
    readonly pages: string
    readonly photographyProjects: string
    readonly photos: string
    readonly posts: string
    readonly softwareProjects: string
  }
  readonly db: DatabaseClient
  readonly notion: Client
}

export const createNotionSyncRuntime = (
  environment: NotionSyncEnvironment
): NotionSyncRuntime => {
  const validatedEnvironment = syncEnvironmentSchema.parse(environment)
  const databaseConnection = createDatabaseConnection(
    validatedEnvironment.DATABASE_URL
  )

  return {
    bucket: new S3Client({
      credentials: {
        accessKeyId: validatedEnvironment.BUCKET_ACCESS_KEY_ID,
        secretAccessKey: validatedEnvironment.BUCKET_SECRET_ACCESS_KEY
      },
      endpoint: validatedEnvironment.BUCKET_ENDPOINT,
      region: "us-east-1"
    }),
    bucketName: validatedEnvironment.BUCKET_NAME,
    close: databaseConnection.close,
    databaseIds: {
      pages: validatedEnvironment.NOTION_PAGES_DB_ID,
      photographyProjects:
        validatedEnvironment.NOTION_PHOTOGRAPHY_PROJECTS_DB_ID,
      photos: validatedEnvironment.NOTION_PHOTOS_DB_ID,
      posts: validatedEnvironment.NOTION_POSTS_DB_ID,
      softwareProjects: validatedEnvironment.NOTION_SOFTWARE_PROJECTS_DB_ID
    },
    db: databaseConnection.db,
    notion: new Client({ auth: validatedEnvironment.NOTION_TOKEN })
  }
}
