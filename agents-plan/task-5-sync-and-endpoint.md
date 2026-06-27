# Task 5 — Sync orchestration + endpoint

> Read [plan.md](./plan.md) and [principles.md](./principles.md) first.
> Part of the content-sync milestone (tasks 1–5; see [plan.md](./plan.md)). **Depends on:** 4 (and
> transitively 1–3). This is the **end-to-end milestone**. Commit to the current branch.

## Goal

Tie the pieces together: a sync that reads each Notion database, maps + fetches +
re-hosts via 4, and upserts rows into Postgres by `notionPageId`; exposed through
a secret-guarded job endpoint. After this, editing Notion and running the job
makes content appear on the live site.

## Steps

1. **`src/notion/sync.ts`** — for each of the three Notion DBs:
   - Query the database for pages (handle pagination).
   - For each page: `mapping.ts` → row values, `blocks.ts` → block tree,
     `media.ts` → re-hosted images (rewrite URLs inside the tree).
   - Upsert into `posts`/`projects`/`pages` keyed by `notionPageId` (insert or
     update). Reuse/extend the upsert helpers in
     [src/db/adminContent.ts](../src/db/adminContent.ts); write both `body` (block
     tree) and the mapped scalar columns. Leave `bodyMarkdown` untouched/null for
     Notion-sourced rows.
   - **Slug freeze + rename (see plan.md):** look up the existing row by
     `notionPageId`. For a published row, keep its stored slug unless the mapped
     slug actually differs (an intentional rename); on a real change, push the old
     slug into `slugHistory` (deduped, never containing the current slug) and set
     the new slug → enables the 301 wired in 3. New/unpublished rows take the
     mapped slug directly. On a unique-slug collision with a *different*
     `notionPageId`, fail that page with a clear error (no auto-suffix).
   - Idempotent: re-running updates in place, no duplicate rows or media, and does
     not grow `slugHistory` when the slug is unchanged.
   - Return a small summary (counts per type, errors).
2. **`POST /api/jobs/sync-content`** — new route:
   - Read `JOBS_SECRET` via `getNotionEnvs()`; require it in an
     `Authorization`/`x-jobs-secret` header; **constant-time compare**; 401 on
     mismatch.
   - Call `sync.ts`; return the summary as JSON. `export const dynamic = "force-dynamic"`.
   - Follow the existing route style in [src/app/api](../src/app/api).
3. **Cron** — add a **Railway Cron Job** service that POSTs this endpoint with
   `JOBS_SECRET` every ~15 min (cadence adjustable). Not a long-running worker or
   a function — a full sync can run long under Notion's rate limit. The endpoint
   stays available for manual and future webhook-driven triggers. Document the
   cron job + cadence in [docs/deployment.md](../docs/deployment.md).

## Acceptance criteria

- `POST /api/jobs/sync-content` with the secret syncs all three Notion DBs into
  Postgres; rows carry the `body` block tree; images are re-hosted and served via
  `/media/[id]` (no expiring Notion URL in output); `status` gates publish.
- The synced content renders on the public pages (via 2/3).
- Re-running the job updates rows in place with no duplicate rows or media.
- The endpoint returns 401 without the secret.
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass.

## Tests

- `sync.ts`: with `mapping`/`blocks`/`media` and `@/db/client` mocked, asserts
  upsert-by-`notionPageId` is called with the mapped values + block tree, and that
  a second run updates rather than inserts. Slug bookkeeping: unchanged slug →
  `slugHistory` not grown; changed slug on a published row → old slug appended;
  collision with a different `notionPageId` → error.
- Endpoint: rejects without `JOBS_SECRET`; calls `sync` and returns the summary
  when authorized.

## Manual verification (end-to-end)

1. Point env at a real test Notion workspace; create one post, one project, one
   page (with an image and a couple of block types).
2. `curl -X POST` the endpoint with the secret; confirm rows + re-hosted media.
3. Visit `/blog/[slug]`, `/projects/[category]/[slug]`, `/`, `/contact`; confirm
   rendering. Edit in Notion, re-run, confirm the update and no duplicate media.

## Notes

- This completes the content sync (tasks 1–5). Only after this is verified **in
  production** should Task 7 (removal of the dashboard + `bodyMarkdown`) begin.
