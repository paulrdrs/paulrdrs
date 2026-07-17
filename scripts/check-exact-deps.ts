// Enforces the repo rule: every dependency must pin an exact version.
// No `^`/`~`/range specifiers. `.npmrc` (save-exact=true) keeps `pnpm add`
// exact; this guard also catches hand-edited package.json entries.
import { readFileSync } from "node:fs"

type DependencyMap = Record<string, string>

type PackageJson = {
  dependencies?: DependencyMap
  devDependencies?: DependencyMap
  optionalDependencies?: DependencyMap
  peerDependencies?: DependencyMap
}

const pkg: PackageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
)

const fields: Array<keyof PackageJson> = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies"
]

// Exact semver, e.g. 1.2.3 or 1.2.3-beta.1. Protocol specs (workspace:, npm:,
// file:, link:, git…) are allowed and skipped via the ":" check below.
const exactVersion = /^\d+\.\d+\.\d+(?:[-+].+)?$/

const offenders: string[] = []
for (const field of fields) {
  const deps = pkg[field] ?? {}
  for (const [name, spec] of Object.entries(deps)) {
    if (spec.includes(":")) {
      continue
    }
    if (!exactVersion.test(spec)) {
      offenders.push(`${field}: "${name}": "${spec}"`)
    }
  }
}

if (offenders.length > 0) {
  console.error("Dependencies must pin an exact version (no ^, ~, or ranges):")
  for (const offender of offenders) {
    console.error(`  ✗ ${offender}`)
  }
  console.error(
    "\nUse an exact version. `.npmrc` has save-exact=true so `pnpm add` pins automatically."
  )
  process.exit(1)
}

console.log("All dependencies pin exact versions ✓")
