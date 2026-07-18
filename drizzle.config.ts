import { createRequire } from "node:module"
import { defineConfig } from "drizzle-kit"

const resolvePackage = createRequire(import.meta.url).resolve
const databaseSchemaPath = resolvePackage("@paulrdrs/database/schema")

// SQLite dialect for Cloudflare D1. Migrations are generated here and applied
// with `wrangler d1 migrations apply` (see package.json), not `drizzle-kit
// migrate`.
export default defineConfig({
  dialect: "sqlite",
  schema: databaseSchemaPath,
  out: "./drizzle",
  strict: true,
  verbose: true
})
