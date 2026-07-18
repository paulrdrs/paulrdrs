import { readFileSync } from "node:fs"
import { URL as NodeUrl } from "node:url"

const configSource = readFileSync(
  new NodeUrl("../wrangler.jsonc", import.meta.url),
  "utf8"
)
const config = JSON.parse(configSource.replace(/^\s*\/\/.*$/gm, "")) as Record<
  string,
  unknown
>

describe("web Worker configuration", () => {
  it("deploys as the web Worker", () => {
    expect(config.name).toBe("web")
    expect(config.account_id).toBe("e590ee3208ef5a3a9e75473b8beaa344")
  })

  it("preserves dashboard-managed runtime variables", () => {
    expect(config.keep_vars).toBe(true)
  })

  it("uses the temporary Workers.dev origin", () => {
    expect(config.vars).toEqual({
      SITE_URL: "https://web.paulrdrs.workers.dev"
    })
  })

  it("loads migrations from the database package", () => {
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
