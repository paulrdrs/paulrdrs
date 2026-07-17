import { defineConfig } from "drizzle-kit"

// SQLite dialect for Cloudflare D1. Migrations are generated here and applied
// with `wrangler d1 migrations apply` (see package.json), not `drizzle-kit
// migrate`.
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  strict: true,
  verbose: true
})
