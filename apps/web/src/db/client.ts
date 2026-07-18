import "server-only"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import * as schema from "@paulrdrs/database/schema"
import { drizzle } from "drizzle-orm/d1"

// Resolve D1 per request instead of caching a binding across isolates.
export const getDb = () => {
  const { env } = getCloudflareContext()

  return drizzle(env.DB, { schema })
}
