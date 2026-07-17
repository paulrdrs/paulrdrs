import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache"
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue"

// ISR: the content detail routes (blog posts, projects, photos) render on first
// request and cache their HTML in R2, revalidating on a timer. The memory queue
// handles background revalidation without extra infra (a Durable Object queue is
// the production upgrade if concurrency ever warrants it). Time-based revalidate
// is enough here — content changes flow in via the 15-min Notion sync.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: memoryQueue
})
