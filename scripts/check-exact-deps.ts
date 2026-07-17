// Enforces the repo rule: every dependency must pin an exact version.
// No `^`/`~`/range specifiers. `.npmrc` (save-exact=true) keeps `pnpm add`
// exact; this guard also catches hand-edited package.json entries.
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

type DependencyMap = Record<string, string>

type PackageJson = {
  dependencies?: DependencyMap
  devDependencies?: DependencyMap
  optionalDependencies?: DependencyMap
  peerDependencies?: DependencyMap
}

const fields: Array<keyof PackageJson> = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies"
]

// Exact semver, e.g. 1.2.3 or 1.2.3-beta.1. Protocol specs (workspace:, npm:,
// file:, link:, git…) are allowed and skipped via the ":" check below.
const exactVersion = /^\d+\.\d+\.\d+(?:[-+].+)?$/

const repositoryRoot = new URL("..", import.meta.url)
const packageManifestPaths = ["package.json"]

for (const workspaceDirectory of ["apps", "packages", "workers"]) {
  const workspaceDirectoryUrl = new URL(
    `${workspaceDirectory}/`,
    repositoryRoot
  )

  try {
    const workspaceEntries = readdirSync(workspaceDirectoryUrl, {
      withFileTypes: true
    })
    for (const workspaceEntry of workspaceEntries) {
      if (workspaceEntry.isDirectory()) {
        packageManifestPaths.push(
          join(workspaceDirectory, workspaceEntry.name, "package.json")
        )
      }
    }
  } catch (error) {
    const missingDirectoryError = error as NodeJS.ErrnoException
    if (missingDirectoryError.code !== "ENOENT") {
      throw error
    }
  }
}

const offenders: string[] = []
for (const packageManifestPath of packageManifestPaths) {
  const packageManifest: PackageJson = JSON.parse(
    readFileSync(new URL(packageManifestPath, repositoryRoot), "utf8")
  )
  for (const field of fields) {
    const dependencies = packageManifest[field] ?? {}
    for (const [dependencyName, versionSpecification] of Object.entries(
      dependencies
    )) {
      if (versionSpecification.includes(":")) {
        continue
      }
      if (!exactVersion.test(versionSpecification)) {
        offenders.push(
          `${packageManifestPath} ${field}: "${dependencyName}": "${versionSpecification}"`
        )
      }
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
