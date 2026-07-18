import type { NotionSyncWorkflowParams } from "./workflow"

// biome-ignore lint/performance/noBarrelFile: Cloudflare discovers the Workflow class from the Worker entrypoint export.
export { NotionSyncWorkflow } from "./workflow"

export default {
  async scheduled(_controller, environment, _context) {
    await environment.SYNC_WORKFLOW.create()
  }
} satisfies ExportedHandler<
  CloudflareEnv & { SYNC_WORKFLOW: Workflow<NotionSyncWorkflowParams> }
>
