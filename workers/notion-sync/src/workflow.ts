import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep
} from "cloudflare:workers"
import { createNotionSyncRuntime, type NotionSyncEnvironment } from "./runtime"
import {
  createNotionSync,
  type NotionSyncSummary,
  type NotionSyncTypeSummary
} from "./sync"

export type NotionSyncWorkflowParams = Record<string, never>

export const notionSyncStages = [
  { pauseAfter: true, type: "posts" },
  { pauseAfter: true, type: "photographyProjects" },
  { pauseAfter: true, type: "softwareProjects" },
  { pauseAfter: true, type: "photos" },
  { pauseAfter: false, type: "pages" }
] as const

export type NotionSyncStageType = (typeof notionSyncStages)[number]["type"]

type StageLog = {
  readonly errors: readonly string[]
  readonly stage: NotionSyncStageType
  readonly synced: number
}

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

const runStage = async (
  stage: NotionSyncStageType,
  sync: () => Promise<NotionSyncTypeSummary>
) => {
  let summary: NotionSyncTypeSummary

  try {
    summary = await sync()
  } catch (error) {
    const stageLog: StageLog = {
      errors: [toErrorMessage(error)],
      stage,
      synced: 0
    }
    console.error("Notion sync stage failed", stageLog)
    throw error
  }

  const stageLog: StageLog = { ...summary, stage }
  if (summary.errors.length > 0) {
    console.error("Notion sync stage failed", stageLog)
    throw new Error(`Notion ${stage} sync failed: ${summary.errors.join("; ")}`)
  }

  console.info("Notion sync stage completed", stageLog)
  return summary
}

export class NotionSyncWorkflow extends WorkflowEntrypoint<
  CloudflareEnv & NotionSyncEnvironment,
  NotionSyncWorkflowParams
> {
  async run(
    _event: Readonly<WorkflowEvent<NotionSyncWorkflowParams>>,
    step: WorkflowStep
  ): Promise<NotionSyncSummary> {
    const runtime = createNotionSyncRuntime(this.env)
    const sync = createNotionSync(runtime)
    const stageSummaries: Record<
      NotionSyncStageType,
      NotionSyncTypeSummary | undefined
    > = {
      pages: undefined,
      photographyProjects: undefined,
      photos: undefined,
      posts: undefined,
      softwareProjects: undefined
    }

    for (const { pauseAfter, type } of notionSyncStages) {
      stageSummaries[type] = await step.do(`sync-${type}`, () =>
        runStage(type, () => syncStage(sync, type))
      )

      if (pauseAfter) {
        await step.sleep(`pause-after-${type}`, "2 seconds")
      }
    }

    return {
      pages: requireStageSummary(stageSummaries.pages, "pages"),
      photographyProjects: requireStageSummary(
        stageSummaries.photographyProjects,
        "photographyProjects"
      ),
      photos: requireStageSummary(stageSummaries.photos, "photos"),
      posts: requireStageSummary(stageSummaries.posts, "posts"),
      softwareProjects: requireStageSummary(
        stageSummaries.softwareProjects,
        "softwareProjects"
      )
    }
  }
}

const requireStageSummary = (
  summary: NotionSyncTypeSummary | undefined,
  stage: NotionSyncStageType
) => {
  if (!summary) {
    throw new Error(`Notion ${stage} sync did not produce a summary`)
  }

  return summary
}

type NotionSync = ReturnType<typeof createNotionSync>

const syncStage = (sync: NotionSync, stage: NotionSyncStageType) => {
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
