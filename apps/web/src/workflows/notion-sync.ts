import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep
} from "cloudflare:workers"
import { notionSyncStages } from "./notion-sync-plan"
import { readNotionSyncStageResponse } from "./notion-sync-response"

// The sync core (getDb/R2/Notion) relies on OpenNext's per-request Cloudflare
// context, which only exists inside the fetch handler. So instead of running
// the sync directly here, the Workflow drives one durable step per Notion
// database, each calling the app's own `/api/jobs/sync-content` route through
// the self service-binding. Every step therefore runs in a real request
// context, gets its own subrequest budget, and is retried independently.
type Params = Record<string, never>

export class NotionSyncWorkflow extends WorkflowEntrypoint<
  CloudflareEnv,
  Params
> {
  async run(_event: WorkflowEvent<Params>, step: WorkflowStep) {
    const summary: Record<string, unknown> = {}

    // Photos remain after projects so relation targets exist. Pauses occur only
    // between stages; sleeping after the final page sync adds no rate-limit
    // protection because the Workflow performs no subsequent Notion request.
    for (const { pauseAfter, type } of notionSyncStages) {
      summary[type] = await step.do(`sync-${type}`, async () => {
        // Cast avoids a circular binding type (WORKER_SELF_REFERENCE → this
        // worker → this workflow); a plain Fetcher is all we need here.
        const worker = this.env.WORKER_SELF_REFERENCE as Fetcher
        const response = await worker.fetch(
          new Request(`https://worker/api/jobs/sync-content?type=${type}`, {
            method: "POST",
            headers: { "x-jobs-secret": this.env.JOBS_SECRET }
          })
        )

        return readNotionSyncStageResponse(response, type)
      })

      if (pauseAfter) {
        // Space databases out to stay comfortably under Notion's ~3 req/s limit.
        await step.sleep(`pause-after-${type}`, "2 seconds")
      }
    }

    return summary
  }
}
