# Migration Plan — Replace the dashboard with Notion as CMS

> Shared context for all tasks in this directory. Each `task-*.md` is a
> self-contained unit meant to run in its own (cold) Claude session and be
> committed separately. Read [principles.md](./principles.md) before writing code.

## Why

The custom dashboard/CMS is the heaviest, highest-maintenance part of the
codebase: passkey/WebAuthn auth, server actions, the content + page editors, and
the media upload UI. We want to delete that surface and author content in
**Notion** instead, while keeping the public site fast and unchanged for
visitors.

## Architecture decisions

- **Content flow:** a scheduled job syncs Notion → the existing Postgres tables;
  the public site keeps rendering from Postgres. Notion stays off the request
  path, quarantined to one job. Public content pages are already
  `force-dynamic`, so a DB write is reflected on the next request — **no
  ISR/revalidation layer is required**.
- **No Markdown.** Markdown can't represent callouts, toggles, columns, colored
  text, etc. — the richness Notion is being adopted for. We **store the Notion
  block tree as `jsonb`** and render it with a **custom React block renderer** on
  the official `@notionhq/client`. The content-safety model shifts from "Markdown
  only" to "render a known whitelist of block types via React": React escapes all
  text, there is no raw HTML / `dangerouslySetInnerHTML`, and only image URLs are
  re-hosted. Design stays consistent with the site's own components/tokens.
- **Transitional dual column (keeps every commit green).** The new `body`
  (`jsonb`) column is added **alongside** the existing `bodyMarkdown`, not as a
  replacement. Public pages prefer `body` and fall back to the Markdown renderer
  when `body` is absent, so the dashboard keeps working all through tasks 1–6.
  `bodyMarkdown`, `MarkdownContent`, and the fallback are removed in task 7.
- **SEO URLs / slugs.** Public routes stay slug-based; `notionPageId` is internal
  and never appears in a URL (so no `/post/<hash>`). Each post/project has an
  explicit Notion **`Slug` property**, normalized via the existing `createSlug`
  ([src/lib/content.ts](../src/lib/content.ts)), and **frozen once published** so
  title edits never change the URL. A `slugHistory` array records prior slugs and
  the dynamic route **301-redirects** an old slug → the current one. Slug
  collisions **fail the sync with a clear error** (no silent `-2` suffixing).
  Keyed pages (home/contact) have fixed routes and need no slug handling.
- **Stats:** a scheduled job reads the existing Postgres analytics aggregates and
  upserts a digest into a Notion database (~5 min cadence). Raw analytics stays
  in Postgres; Notion holds only the digest.
- **Scheduling:** use **Railway Cron Jobs** (not a long-running worker or a
  function — a full sync can run long under Notion's ~3 req/s limit and would risk
  a function timeout). A cron service POSTs the guarded `/api/jobs/*` endpoints
  with `JOBS_SECRET` (content ~15 min, stats ~5 min); the endpoints stay available
  for manual and future webhook-driven triggers.
- **Removal:** delete the dashboard and all passkey auth entirely (last, after
  Notion-sourced content is proven in production).

> The full Notion property → column contract lives in
> [notion-schema.md](./notion-schema.md).

## Notion gotchas (designed around)

- **Re-host every image to the Railway bucket; never hotlink Notion.** Uploaded
  files have short-lived **presigned S3 links** (expire ~1h), and external
  (URL-added) images would be blocked by our `img-src 'self'` CSP. So all images
  — uploaded, external, and covers — are downloaded during sync, stored in the
  bucket via the existing media layer, and served through `/media/[id]`.
  Idempotent via a unique `media_assets.sourceKey`.
- API rate limit ~**3 req/s** — batch, run on a schedule; recursive child-block
  fetches count against it.
- **Nested blocks** (toggles, columns, nested lists, callouts with children)
  require walking `block.children` with pagination during sync.
- Notion page IDs are UUIDs — convenient as a stable `notionPageId` key.

## Existing code to reuse (do not reinvent)

- Media storage: `uploadMediaObject`, `getMediaObject` in
  [src/media/storage.ts](../src/media/storage.ts); `buildMediaObjectKey` in
  [src/media/upload.ts](../src/media/upload.ts).
- Media metadata + content upserts: [src/db/adminContent.ts](../src/db/adminContent.ts).
- Public read queries (cached with React `cache()`): [src/db/content.ts](../src/db/content.ts).
- Analytics aggregate: `getDashboardAnalyticsSummary()` in
  [src/db/analytics.ts](../src/db/analytics.ts).
- Env validation pattern: [src/envs/schemas.ts](../src/envs/schemas.ts) +
  [src/envs/server.ts](../src/envs/server.ts) (`getSiteEnvs`, `getStorageEnvs`, …).
- Image component: [src/components/ContentImage.tsx](../src/components/ContentImage.tsx).
- Metadata builder: [src/lib/metadata.ts](../src/lib/metadata.ts).

## Tasks

Each row is its own commit/session. Tasks 1–5 build the Notion content sync;
task 6 adds the stats job; task 7 removes the dashboard + auth.

| # | Task | File | Depends on |
| --- | --- | --- | --- |
| 1 | Foundations & types | [task-1-foundations.md](./task-1-foundations.md) | — |
| 2 | Block renderer | [task-2-block-renderer.md](./task-2-block-renderer.md) | 1 |
| 3 | Schema + page rendering | [task-3-schema-and-rendering.md](./task-3-schema-and-rendering.md) | 1, 2 |
| 4 | Notion fetch + mapping + media | [task-4-notion-fetch-and-mapping.md](./task-4-notion-fetch-and-mapping.md) | 1, 3 |
| 5 | Sync orchestration + endpoint | [task-5-sync-and-endpoint.md](./task-5-sync-and-endpoint.md) | 4 |
| 6 | Stats → Notion digest job | [task-6-stats-to-notion.md](./task-6-stats-to-notion.md) | 1, 5 (env + job infra) |
| 7 | Remove dashboard + passkey auth | [task-7-remove-dashboard-and-auth.md](./task-7-remove-dashboard-and-auth.md) | tasks 1–5 verified in prod |

Tasks 1–6 are **additive** — the dashboard keeps working throughout (dual-column
body), so the site is never broken mid-migration. Task 7 is the only destructive
step.

## Global definition of done (every task)

- `pnpm typecheck && pnpm lint && pnpm test` and `pnpm build` all pass.
- New/changed logic has colocated unit tests following existing patterns.
- Conventional-commit message; the task is a single focused commit on the current branch (do not create a new branch).
- Drizzle migrations generated via `pnpm db:generate` (never hand-edited); run
  `pnpm format` on generated `drizzle/meta/*` so Biome is happy.

## Autonomous chaining (scheduled runs)

When a task runs as a scheduled agent, it should **self-advance the migration**:
after a clean, committed task, schedule the next task to run ~2 hours later (via
the scheduled-tasks tool). Guardrails:

- **Only chain on success.** If any gate fails or the commit did not happen, do
  NOT schedule the next task — report the blocker instead.
- **Chain tasks 4 → 5 only.** STOP before task 6 (stats → Notion — needs
  `NOTION_STATS_DB_ID` and a Notion stats database) and task 7 (destructive
  dashboard/auth removal). Those require manual kickoff.
- Commit to the current branch; never create a branch, push, or open a PR.

## Resolved decisions

- **Property contract:** defined in [notion-schema.md](./notion-schema.md)
  (Posts/Projects/Pages properties, Status = Draft/Published, Slug required,
  project Links as `Label | URL` lines, category select, database templates).
- **Renderer v1:** the Standard block set (see notion-schema.md).
- **Scheduling:** Railway Cron Jobs hitting the guarded endpoints (content
  ~15 min, stats ~5 min).

### Still requires user action (not code)

- Build the three Notion databases with the properties in
  [notion-schema.md](./notion-schema.md), add their database templates, and
  provide the integration token + database IDs (env in task 1).

### Deferred (post-v1)

- Homepage hero selection modeled in Notion (the site falls back gracefully today).
- "Rich" blocks: columns, tables, bookmarks/embeds, equations.
