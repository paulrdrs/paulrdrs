import "server-only"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { drizzle } from "drizzle-orm/d1"
import * as schema from "./schema"

// The D1 binding lives on the Cloudflare context, populated per request by the
// OpenNext worker (and by `initOpenNextCloudflareForDev()` during `next dev`).
// Drizzle wrapping is cheap, so we build it per call rather than caching across
// requests/isolates.
export const getDb = () => {
  const { env } = getCloudflareContext()

  return drizzle(env.DB, { schema })
}
