import type { DatabaseClient } from "@paulrdrs/database/client"
import { sql } from "drizzle-orm"
import { createNotionSyncRuntime, type NotionSyncEnvironment } from "./runtime"
import {
  createNotionSync,
  type NotionSyncSummary,
  type NotionSyncTypeSummary
} from "./sync"

const syncAdvisoryLockKey = 720_284_018
const pauseBetweenStagesMilliseconds = 2_000
const maximumAttempts = 3

export const notionSyncStages = [
  "posts",
  "photographyProjects",
  "softwareProjects",
  "photos",
  "pages"
] as const

type NotionSyncStage = (typeof notionSyncStages)[number]

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

const retryStage = async (
  stage: NotionSyncStage,
  operation: () => Promise<NotionSyncTypeSummary>
) => {
  let lastError: unknown

  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      const summary = await operation()

      if (summary.errors.length === 0) {
        console.info("Notion sync stage completed", { ...summary, stage })
        return summary
      }

      lastError = new Error(summary.errors.join("; "))
    } catch (error) {
      lastError = error
    }

    console.error("Notion sync stage attempt failed", {
      attempt,
      error: errorMessage(lastError),
      stage
    })

    if (attempt < maximumAttempts) {
      await wait(2 ** attempt * 1_000)
    }
  }

  throw new Error(
    `Notion ${stage} sync failed after ${maximumAttempts} attempts: ${errorMessage(lastError)}`
  )
}

const syncStage = (
  sync: ReturnType<typeof createNotionSync>,
  stage: NotionSyncStage
) => {
  switch (stage) {
    case "posts":
      return sync.syncPosts()
    case "photographyProjects":
      return sync.syncPhotographyProjects()
    case "softwareProjects":
      return sync.syncSoftwareProjects()
    case "photos":
      return sync.syncPhotos()
    case "pages":
      return sync.syncPages()
  }
}

export const runNotionSync = async (): Promise<NotionSyncSummary | null> => {
  const runtime = createNotionSyncRuntime(process.env as NotionSyncEnvironment)

  try {
    return await runtime.db.transaction(async (transaction) => {
      // Drizzle's transaction has the same query interface as the connection,
      // while keeping the PostgreSQL advisory lock on one session.
      const lockedRuntime = {
        ...runtime,
        db: transaction as DatabaseClient
      }
      const [lock] = await lockedRuntime.db.execute<{ acquired: boolean }>(
        sql`select pg_try_advisory_lock(${syncAdvisoryLockKey}) as acquired`
      )

      if (!lock?.acquired) {
        console.info("Notion sync skipped because another run is active")
        return null
      }

      const sync = createNotionSync(lockedRuntime)

      try {
        const stageSummaries = {} as Record<
          NotionSyncStage,
          NotionSyncTypeSummary
        >

        for (const [index, stage] of notionSyncStages.entries()) {
          stageSummaries[stage] = await retryStage(stage, () =>
            syncStage(sync, stage)
          )

          if (index < notionSyncStages.length - 1) {
            await wait(pauseBetweenStagesMilliseconds)
          }
        }

        return {
          pages: stageSummaries.pages,
          photographyProjects: stageSummaries.photographyProjects,
          photos: stageSummaries.photos,
          posts: stageSummaries.posts,
          softwareProjects: stageSummaries.softwareProjects
        }
      } finally {
        await lockedRuntime.db.execute(
          sql`select pg_advisory_unlock(${syncAdvisoryLockKey})`
        )
      }
    })
  } finally {
    await runtime.close()
    runtime.bucket.destroy()
  }
}

export const runNotionSyncCommand = async () => {
  try {
    await runNotionSync()
  } catch (error) {
    console.error("Notion sync failed", { error: errorMessage(error) })
    process.exitCode = 1
  }
}
