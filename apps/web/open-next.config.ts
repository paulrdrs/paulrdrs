import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache"
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue"

// Cache ISR output in R2 and run timed revalidation through the in-memory queue.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: memoryQueue
})
