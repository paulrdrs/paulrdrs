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
  it("preserves dashboard-managed runtime variables", () => {
    expect(config.keep_vars).toBe(true)
  })
})
