# Separate Notion Sync Worker

## Summary

Split synchronization into an independent Cloudflare Worker:

- `@paulrdrs/web` in `apps/web`: the public Next.js/OpenNext application,
  deployed with Worker script name `paulrdrs` and limited to content reads and
  media delivery.
- `@paulrdrs/notion-sync`: a private, scheduled Worker owning cron, Workflow
  orchestration, Notion access, D1 writes, and R2 uploads.
- `@paulrdrs/content`: runtime-neutral normalized Notion block-tree and shared
  content contracts.
- `@paulrdrs/database`: the Drizzle schema, depending on `@paulrdrs/content` for
  persisted content types.
- `@paulrdrs/workspace`: the private root orchestration package owning shared
  commands, repository-wide checks, migration commands, and development tools.

The sync Worker will execute synchronization directly against its bindings. The
private app job route, `JOBS_SECRET`, self-service binding, and
OpenNext-context workaround will be removed. The web app will have no binding or
HTTP path to the sync Worker.

The sync Worker has no HTTP interface. Analytics and webhooks are also out of
scope; any future HTTP design will start from its concrete requirements.

## Key Changes

### Workspace and shared packages

- Add workspace patterns for `apps/*`, `packages/*`, and `workers/*`.
- Move the existing Next.js/OpenNext application from the repository root into
  `apps/web` as the private `@paulrdrs/web` workspace package. Move its `src`,
  `public`, Next.js/OpenNext configuration, Wrangler configuration, environment
  typing, test configuration, and app-specific dependencies/scripts together.
- Keep the repository root as the workspace orchestration and migration
  boundary, named `@paulrdrs/workspace`. Root commands delegate to workspace
  packages, while `drizzle/`, the root Drizzle configuration, repository-wide
  checks, shared documentation, and the lockfile remain at the root.
- Preserve the public app's deployed Worker script name `paulrdrs`, routes,
  bindings, compatibility settings, and build behavior during the move.
- Move normalized Notion block-tree types, content status/category types, and
  the page-key contract into `@paulrdrs/content`. Keep it free of React,
  Next.js, Cloudflare, Drizzle, and other runtime dependencies.
- Move the Drizzle schema into `@paulrdrs/database`. It depends on
  `@paulrdrs/content`; the content package must never depend on the database
  package.
- Export explicit package subpaths and update the app, migration tooling, and
  sync Worker to consume them directly.
- Preserve all existing migration SQL and keep migration commands at the
  repository root.
- Update dependency validation and aggregate test/typecheck scripts to cover
  every workspace manifest.

### Dedicated scheduled Worker

- Create `workers/notion-sync` with its own manifest, TypeScript/Vitest
  configuration, Wrangler configuration, generated environment type, and
  entrypoint.
- Give the Worker no HTTP ingress: no HTTP framework, `fetch` handler, Service
  Binding, route, custom domain, or HTTP authentication secret. Set
  `workers_dev` and `preview_urls` to `false` explicitly.
- Use Worker script name `paulrdrs-notion-sync` while reusing the existing
  Workflow resource name `notion-sync`.
- Bind only the existing D1 database, media R2 bucket, Workflow, required Notion
  configuration, cron, and observability. Do not bind app assets, image
  transformation, or ISR storage.
- Move Notion mapping, block fetching, media validation/rehosting,
  reconciliation, and their tests into this package.
- Construct synchronization dependencies explicitly from the Worker
  environment:
  - Drizzle from `env.DB`.
  - R2 operations from `env.BUCKET`.
  - Notion client from `env.NOTION_TOKEN`.
  - Database IDs from the four `NOTION_*_DB_ID` values.
- Validate all required sync configuration at Workflow startup.
- Keep the ordered Workflow stages posts, projects, photos, and pages,
  including bounded preparation concurrency and pauses between stages.
- Preserve structured stage summaries. Entry errors must throw from the
  Workflow step so Cloudflare records and retries failures; logs must include
  the stage, synced count, and entry errors.
- Export the `WorkflowEntrypoint` and a Worker handler containing only
  `scheduled`; every cron event creates one parameterless full-sync Workflow.
  Keep the existing 15-minute schedule.
- Manual recovery remains a parameterless full sync through Wrangler's built-in
  Workflow trigger.
- Provide package scripts for development, dry-run build, typecheck, tests,
  deploy, trigger, and Workflow instance inspection.

### App cleanup and tooling

- Perform app cleanup in `apps/web` after its relocation from the repository
  root.
- Point `apps/web/wrangler.jsonc` directly at `.open-next/worker.js` relative to
  the app package and delete the custom app Worker entrypoint.
- Remove the app cron, Workflow binding, and `WORKER_SELF_REFERENCE` service
  binding.
- Delete `/api/jobs/sync-content`, its tests, app-side Workflow modules,
  response parsing, and Notion synchronization implementation.
- Remove `JOBS_SECRET`, `NOTION_*`, and every sync-Worker binding or variable
  from the app.
- Retain read-only D1/media adapters in the app. Move sync-only upload,
  validation, and object-key generation into the sync package.
- Keep deployments independent:
  - Root `deploy` delegates to `@paulrdrs/web` and deploys only the public app.
  - `deploy:sync` deploys only the sync Worker.
- Add root convenience commands for web development/build/deploy and sync
  development/build/deploy/trigger/instance inspection.
- Update architecture, content, authentication, local-development, and
  deployment documentation for the scheduled-only Worker.

## Test and Rollout Plan

- Relocate existing mapper, block, media, reconciliation, concurrency, and
  partial-failure tests.
- Add tests for:
  - Environment validation.
  - Direct D1/R2/Notion dependency construction.
  - Scheduled Workflow creation.
  - Ordered stages and structured failure propagation.
  - Full-sync-only Workflow parameters.
  - Sync Wrangler configuration explicitly sets `workers_dev: false` and
    `preview_urls: false` and declares no public route or custom domain.
  - The sync Worker exports `scheduled` but no `fetch` handler and has no HTTP
    dependencies or bindings.
- Verify app tests no longer reference synchronization code.
- Verify the app builds and tests from `apps/web` and through the delegated root
  commands, with no stale root-relative configuration or imports.
- Run lint, dependency and file-type checks, all workspace typechecks/tests,
  the OpenNext build, and the sync Worker dry-run build.
- Confirm the app build no longer emits the Workflow-without-`script_name`
  warning.
- No D1 migration is required.
- Cut over without overlapping cron producers:
  1. Configure `NOTION_TOKEN` as a sync-Worker secret and the four database IDs
     as sync-Worker variables.
  2. Wait for any existing Workflow instance to finish.
  3. Deploy the app without its old cron, Workflow, job route, or self-service
     binding.
  4. Deploy `paulrdrs-notion-sync` with its 15-minute cron, reusing
     `notion-sync`.
  5. Confirm the Worker has `workers_dev: false`, `preview_urls: false`, no
     public routes, and no `fetch` handler.
  6. Trigger one manual full sync, inspect its stage summaries, and smoke-test
     public content and media.
  7. Remove `JOBS_SECRET` and Notion configuration from the deployed app.
- Do not delete the existing `notion-sync` Workflow resource because the new
  Worker reuses it.

## Constraints and non-goals

- Both Workers share the existing D1 database and media R2 bucket.
- The sync Worker is the only content writer.
- Cron is the primary trigger; Wrangler CLI is documented only for smoke tests
  and recovery.
- The sync Worker has no HTTP interface or app binding.
- The repository root is not an application package after relocation;
  `apps/web` owns the Next.js/OpenNext application and remains deployed as
  `paulrdrs`.
- Analytics, webhooks, HTTP endpoints, and targeted database runs are not part
  of this work. Their architecture remains undecided.
- Existing Workflow retry behavior and the 15-minute schedule remain
  unchanged.

## Agent Tasks

The tasks below are ordered. Give each agent the full prompt for its task. An
agent must inspect the current working tree before editing, preserve unrelated
changes, commit only the task-specific work as instructed, and never push.

### Task 1: Relocate the web application

**Prerequisite:** None.

```text
Implement Task 1 from PLAN.md: move the existing Next.js/OpenNext application
from the repository root into the apps/web workspace package.

Read AGENTS.md, PLAN.md, docs/index.md, docs/architecture.md, and
docs/deployment.md first. Inspect the working tree and preserve unrelated
changes. Do not push, deploy, apply migrations, or mutate remote resources.

Add apps/*, packages/*, and workers/* to pnpm-workspace.yaml. Create a private
workspace package named @paulrdrs/web in apps/web. Move the existing src and
public directories plus the app-owned Next.js, OpenNext, PostCSS, TypeScript,
Vitest, Wrangler, generated Cloudflare environment typing, and custom Worker
entrypoint into apps/web. Move app-only dependencies and scripts from the root
manifest into the web package. Keep shared repository tooling and metadata at
the root.

Rename the private root package to @paulrdrs/workspace and turn it into the
workspace orchestration boundary. Add delegated root commands for web
development, build, preview, deploy, tests, and typechecking without creating
recursive script calls. Keep drizzle/, the root Drizzle configuration and
migration commands, scripts/, docs/, repository-wide lint/dependency/file-type
checks, the lockfile, and shared tool configuration at the repository root.

Preserve the deployed app Worker script name paulrdrs, its routes, bindings,
compatibility settings, environment contract, and runtime behavior. Fix all
path-sensitive Next.js, OpenNext, Wrangler, TypeScript, Vitest, Tailwind/PostCSS,
test setup, alias, asset, and generated-output references for the new package
location. Do not perform sync cleanup or change the Workflow/cron behavior in
this task; relocation must be behavior-preserving so later tasks can remove it.

Use exact dependency versions or workspace: specifications and update the
lockfile with pnpm. Run pnpm lint, pnpm typecheck, pnpm test, pnpm check:deps,
pnpm check:no-js, the OpenNext Worker build, and git diff --check. Confirm the
same app tests and build run both through the package and delegated root
commands. Report changed files, verification results, and any unrelated
failures.

At the end, review the diff, stage only the changes belonging to this task, and
commit them with a meaningful conventional commit message. Do not add a
Co-authored-by trailer or any other co-author attribution. Do not push.
```

### Task 2: Create the shared content package

**Prerequisite:** Task 1 complete.

```text
Implement Task 2 from PLAN.md: create the @paulrdrs/content workspace
package.

Read AGENTS.md, PLAN.md, docs/index.md, docs/architecture.md, and
docs/notion-schema.md first. Inspect the working tree and preserve unrelated
changes. Do not push, deploy, or mutate remote resources.

Confirm apps/*, packages/*, and workers/* are present in pnpm-workspace.yaml.
Create a private, source-only TypeScript package named @paulrdrs/content with
explicit exports for normalized Notion block-tree types, content
status/category types, and the page-key contract. Move those contracts from the
app into the package, update all app imports, and remove obsolete wrappers.

The package must remain runtime-neutral: do not add React, Next.js, Cloudflare,
Drizzle, database access, or UI components. It must be safe for the frontend,
database package, and sync Worker to consume without pulling in runtime-specific
code.

Use exact dependency versions or workspace: specifications. Update the lockfile
with pnpm, not by hand. Keep strict TypeScript and existing naming conventions.
Run the relevant app tests, pnpm lint, pnpm typecheck, pnpm test,
pnpm check:deps, pnpm check:no-js, and git diff --check. Report changed files,
verification results, and any unrelated failures.

At the end, review the diff, stage only the changes belonging to this task, and
commit them with a meaningful conventional commit message. Do not add a
Co-authored-by trailer or any other co-author attribution. Do not push.
```

### Task 3: Create the shared database package

**Prerequisite:** Task 2 complete.

```text
Implement Task 3 from PLAN.md: create the @paulrdrs/database workspace package.

Read AGENTS.md, PLAN.md, docs/architecture.md, docs/notion-schema.md, and
docs/deployment.md first. Inspect the current working tree and preserve unrelated
changes. Do not push, deploy, apply migrations, or mutate remote resources.

Create a private, source-only TypeScript package named @paulrdrs/database. Move
the Drizzle schema into it and expose the schema through an explicit package
export. The database package must depend on @paulrdrs/content for block-tree,
content status/category, and related domain types. @paulrdrs/content must never
depend on @paulrdrs/database.

Update all app schema imports and the root drizzle.config.ts to consume
@paulrdrs/database. Preserve existing table names, columns, indexes, relations,
inferred types, and migration behavior. Do not edit, regenerate, delete, or move
existing migration SQL or snapshots. Remove the old app schema source rather
than keeping a duplicate wrapper.

Use exact dependency versions or workspace: specifications and update the
lockfile with pnpm. Run schema/query tests, pnpm lint, pnpm typecheck, pnpm test,
pnpm check:deps, pnpm check:no-js, and git diff --check. Confirm that no migration
was generated and report results.

At the end, review the diff, stage only the changes belonging to this task, and
commit them with a meaningful conventional commit message. Do not add a
Co-authored-by trailer or any other co-author attribution. Do not push.
```

### Task 4: Move synchronization into the dedicated package

**Prerequisite:** Tasks 1-3 complete.

```text
Implement Task 4 from PLAN.md: create the @paulrdrs/notion-sync workspace
package and move the synchronization core into it.

Read AGENTS.md, PLAN.md, docs/architecture.md, docs/notion-schema.md, and
docs/deployment.md first. Inspect the current working tree and preserve unrelated
changes. Do not push, deploy, apply migrations, or mutate remote resources.

Create workers/notion-sync as a private TypeScript workspace package. Move the
Notion client, mapping, block fetching, media rehosting/validation,
reconciliation, and sync orchestration out of the app. Consume
@paulrdrs/content for normalized content contracts and @paulrdrs/database for
the D1 schema.

Remove all getCloudflareContext(), process.env, and server-only coupling from
the moved core. Define explicit runtime dependencies constructed from Worker
bindings: a Drizzle D1 client, R2 bucket access, a Notion client, and validated
database IDs. Keep posts -> projects -> photos -> pages ordering, preparation
concurrency, safe missing-entry reconciliation, atomic photo relation
replacement, bounded media reads, and structured sync summaries unchanged.

Move and adapt all sync-specific unit tests into the package. Tests must cover
mapping failures, query failures, empty-source reconciliation, media limits,
atomic relation failures, ordering, and partial summaries. Add environment and
runtime-construction tests. Use exact dependency versions and update the
lockfile with pnpm. Run package and repository tests/typechecks plus lint,
dependency/file checks, and git diff --check. Report results.

At the end, review the diff, stage only the changes belonging to this task, and
commit them with a meaningful conventional commit message. Do not add a
Co-authored-by trailer or any other co-author attribution. Do not push.
```

### Task 5: Add Workflow, cron, and Worker configuration

**Prerequisite:** Task 4 complete.

```text
Implement Task 5 from PLAN.md: finish the dedicated scheduled Cloudflare Worker
entrypoint and infrastructure configuration in workers/notion-sync.

Read AGENTS.md, PLAN.md, and docs/deployment.md first. Inspect the working tree
and preserve unrelated changes. Do not push, deploy, create resources,
or mutate remote infrastructure.

Export NotionSyncWorkflow and a default Worker handler containing only
scheduled; do not add a fetch handler or HTTP-related dependencies, bindings,
routes, or secrets. Each scheduled event must create one parameterless full-sync
Workflow. Preserve the 15-minute schedule, posts -> projects -> photos -> pages
stage order, pauses only between stages, structured summaries, and failure
logging/propagation.

Add a dedicated wrangler.jsonc using Worker script name
paulrdrs-notion-sync and existing Workflow resource name notion-sync. Bind only
the existing D1 database, media R2 bucket, Workflow, required Notion
configuration, cron, and observability. Add generated environment typing and
package scripts for dev, dry-run build, typecheck, test, deploy, trigger, and
instance inspection. Explicitly set workers_dev and preview_urls to false and
define no route, routes, or custom domain.

Test scheduled Workflow creation, stage ordering, failure propagation,
parameterless full-sync behavior, absence of a fetch handler, and private
Wrangler routing. Fail configuration tests if workers_dev or preview_urls is not
false or if public HTTP ingress is introduced. Run all package and repository
checks plus a dry-run Worker build. Do not deploy.

At the end, review the diff, stage only the changes belonging to this task, and
commit them with a meaningful conventional commit message. Do not add a
Co-authored-by trailer or any other co-author attribution. Do not push.
```

### Task 6: Remove synchronization from the app

**Prerequisite:** Tasks 1-5 complete.

```text
Implement Task 6 from PLAN.md: remove all sync-facing behavior from the public
Next.js/OpenNext app in apps/web now that workers/notion-sync owns it.

Read AGENTS.md, PLAN.md, docs/architecture.md, and docs/deployment.md first.
Inspect the current working tree and preserve unrelated changes. Do not push,
deploy, delete remote secrets, or mutate remote infrastructure.

Point apps/web/wrangler.jsonc main entry directly at .open-next/worker.js
relative to the web package. Remove the custom app Worker entrypoint, cron
trigger, Workflow binding, and WORKER_SELF_REFERENCE service binding. Delete
/api/jobs/sync-content and its tests, app-side Workflow/response modules, and
any remaining sync-only Notion code.

Remove JOBS_SECRET, NOTION_*, and all sync-Worker validation/access from the app.
Do not add a replacement Service Binding, HTTP client, health route, or sync
secret. Keep the app's D1 and media R2 bindings because it still reads content
and serves media. Make media storage in the app read-only; sync-only uploads,
validation, and key generation must exist only in the sync package. Remove app
dependencies that are no longer used.

Confirm no app source or test imports sync implementation code or references a
sync Worker binding, client, endpoint, or secret. Run the full app
test/typecheck/lint suite, dependency/file checks, OpenNext Worker build, and
git diff --check. Confirm the app build no longer prints the local Workflow
binding warning.

At the end, review the diff, stage only the changes belonging to this task, and
commit them with a meaningful conventional commit message. Do not add a
Co-authored-by trailer or any other co-author attribution. Do not push.
```

### Task 7: Integrate workspace tooling and documentation

**Prerequisite:** Tasks 1-6 complete.

```text
Implement Task 7 from PLAN.md: finish repository-wide scripts, checks, and
documentation for the web/content/database/notion-sync workspace.

Read AGENTS.md, PLAN.md, and every document linked from docs/index.md that is
affected by this refactor. Inspect the working tree and preserve unrelated
changes. Do not push, deploy, apply migrations, change secrets, or
mutate remote infrastructure.

Keep root deploy delegated to @paulrdrs/web and scoped to the public app. Add
root convenience commands for web development/build/deploy and sync
development, dry-run build, deploy, Workflow trigger, and instance inspection.
Make aggregate typecheck and test commands cover every workspace package
without recursive script calls. Update check:deps to validate every workspace
manifest and keep check:no-js repository-wide.

Update architecture, content, authentication, local-development, deployment,
and index documentation for: apps/web and @paulrdrs/web while preserving the
paulrdrs Worker script name; the content/database package boundary; direct
D1/R2 access; sync secret/variable ownership; the 15-minute schedule; CLI
recovery; private Worker routing; independent deployments; and app-first
cutover. State concisely that HTTP ingress, analytics, and webhooks are out of
scope.

Run pnpm install if needed, then all lint, dependency, file-type, typecheck,
test, app build, sync dry-run build, and git diff checks. Review the complete
diff for stale route/secret/binding references, accidental generated files,
and documentation contradictions.

At the end, review the diff, stage only the changes belonging to this task, and
commit them with a meaningful conventional commit message. Do not add a
Co-authored-by trailer or any other co-author attribution. Do not push.
```

### Task 8: Final verification and rollout handoff

**Prerequisite:** Tasks 1-7 complete.

```text
Perform Task 8 from PLAN.md as a read-only final review and rollout handoff.

Read AGENTS.md and PLAN.md. Do not edit files unless the user separately asks
for fixes. Do not push, deploy, apply migrations, change secrets, or mutate any
remote resource.

Review all branch changes against the pre-Task-1 base. Look for architectural
boundary violations, reversed or circular @paulrdrs/content and
@paulrdrs/database dependencies, duplicated schema/types, stale app sync code,
unsafe reconciliation, accidental HTTP ingress, analytics scope creep, secret
exposure, and deployment-order risks. Confirm the web app is fully owned by
apps/web, no stale root-app paths remain, and its deployed Worker name is still
paulrdrs. Verify that the sync Worker exports scheduled and NotionSyncWorkflow
but no fetch handler, that cron/CLI runs are full-sync only, that workers_dev
and preview_urls are false, and that neither Worker contains a sync HTTP route
or cross-Worker binding.

Run or confirm successful results for lint, exact dependencies, no-JavaScript,
all workspace typechecks/tests, the OpenNext Worker build, the sync Worker
dry-run build, and git diff --check. Confirm no D1 migration was generated.

Produce a concise handoff containing: findings ordered by severity, verification
results, required sync-Worker secrets/variables, exact app-first then
sync-Worker cutover order, manual-sync smoke tests, and rollback considerations.
Do not perform the rollout.

If the user separately authorizes fixes, implement and verify only those fixes,
then commit them with a meaningful conventional commit message. Do not add a
Co-authored-by trailer or any other co-author attribution. Otherwise, do not
edit files or create an empty commit. Do not push.
```
