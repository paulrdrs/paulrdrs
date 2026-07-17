// Custom worker entry: re-uses OpenNext's generated fetch handler and adds a
// cron `scheduled` handler plus the Notion sync Workflow. `wrangler.jsonc` points
// `main` here instead of `.open-next/worker.js`.
// biome-ignore lint/suspicious/noTsIgnore: the generated module is absent before a build, so @ts-expect-error would itself error once present
// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js"
import { NotionSyncWorkflow } from "./src/workflows/notion-sync"

export { NotionSyncWorkflow }

export default {
  fetch: handler.fetch,

  async scheduled(_controller, env) {
    await env.SYNC_WORKFLOW.create()
  }
} satisfies ExportedHandler<CloudflareEnv>
