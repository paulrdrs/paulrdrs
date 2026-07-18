import { readFileSync } from "node:fs"
import { URL as NodeUrl } from "node:url"

const config = JSON.parse(
  readFileSync(new NodeUrl("../wrangler.jsonc", import.meta.url), "utf8")
) as Record<string, unknown>

describe("private sync Worker configuration", () => {
  it("disables public Worker ingress", () => {
    expect(config.workers_dev).toBe(false)
    expect(config.preview_urls).toBe(false)
    expect(config).not.toHaveProperty("route")
    expect(config).not.toHaveProperty("routes")
    expect(config).not.toHaveProperty("custom_domain")
  })

  it("retains the existing Workflow name and five-minute cron", () => {
    expect(config.name).toBe("notion-sync")
    expect(config.compatibility_flags).toContain("global_fetch_strictly_public")
    expect(config.workflows).toEqual([
      {
        binding: "SYNC_WORKFLOW",
        class_name: "NotionSyncWorkflow",
        name: "notion-sync"
      }
    ])
    expect(config.triggers).toEqual({ crons: ["*/5 * * * *"] })
  })

  it("declares every local Notion value and preserves remote variables", () => {
    expect(config.secrets).toEqual({
      required: [
        "NOTION_TOKEN",
        "NOTION_POSTS_DB_ID",
        "NOTION_PROJECTS_DB_ID",
        "NOTION_PHOTOS_DB_ID",
        "NOTION_PAGES_DB_ID"
      ]
    })
    expect(config.keep_vars).toBe(true)
  })

  it("contains only the sync Worker's infrastructure bindings", () => {
    expect(config).not.toHaveProperty("assets")
    expect(config).not.toHaveProperty("images")
    expect(config).not.toHaveProperty("services")
    expect(config.r2_buckets).toEqual([
      { binding: "BUCKET", bucket_name: "paulrdrs-media" }
    ])
    expect(config.d1_databases).toEqual([
      {
        binding: "DB",
        database_id: "c988153c-6cba-4302-869b-1dfae43cbb27",
        database_name: "paulrdrs",
        migrations_dir: "../../packages/database/drizzle"
      }
    ])
  })
})
