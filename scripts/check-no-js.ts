// Enforces the repo rule: TypeScript only. Plain JavaScript files
// (.js/.jsx/.cjs/.mjs) are not allowed unless they are genuinely unavoidable
// (a tool config with no TypeScript form), in which case allowlist them below.
import { execSync } from "node:child_process"
import { existsSync } from "node:fs"

// Unavoidable JS configs — tools that do not support a TypeScript config form.
const allowlist = new Set([
  "apps/web/postcss.config.mjs" // Next.js PostCSS config has no TypeScript form
])

const tracked = execSync(
  "git ls-files --cached --others --exclude-standard -- '*.js' '*.jsx' '*.cjs' '*.mjs'",
  { encoding: "utf8" }
)

const offenders = tracked
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.length > 0)
  .filter((file) => existsSync(file))
  .filter((file) => !allowlist.has(file))

if (offenders.length > 0) {
  console.error(
    "Only TypeScript is allowed — convert these to .ts/.tsx (or allowlist a truly unavoidable config in scripts/check-no-js.ts):"
  )
  for (const file of offenders) {
    console.error(`  ✗ ${file}`)
  }
  process.exit(1)
}

console.log("No disallowed JavaScript files ✓")
