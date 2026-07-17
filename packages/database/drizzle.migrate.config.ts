import { defineConfig } from "drizzle-kit"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to apply PostgreSQL migrations")
}

// biome-ignore lint/style/noDefaultExport: Drizzle Kit loads its configuration as a default export.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle/postgres",
  dbCredentials: {
    url: databaseUrl
  },
  strict: true,
  verbose: true
})
