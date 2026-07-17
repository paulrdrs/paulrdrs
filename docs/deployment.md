# Cloudflare Deployment

The site deploys to **Cloudflare Workers** via the OpenNext adapter
(`@opennextjs/cloudflare`). App configuration lives in
`apps/web/wrangler.jsonc` and `apps/web/open-next.config.ts`; the worker entry is
`apps/web/custom-worker.ts`, which re-uses OpenNext's generated fetch handler
and adds the cron `scheduled` handler plus the Notion sync Workflow.

DNS for the domain is already on Cloudflare.

## Cloudflare Resources

- **Worker** `paulrdrs`: the Next.js app plus the sync Workflow and cron handler.
- **D1** database `paulrdrs` (binding `DB`): content, media metadata, site settings.
- **R2** bucket `paulrdrs-media` (binding `BUCKET`): media objects.
- **Cloudflare Images** (binding `IMAGES`): responsive variants of media objects.
- **Workflow** `NotionSyncWorkflow` (binding `SYNC_WORKFLOW`): durable Notion sync.
- **Cron trigger** `*/15 * * * *`: launches a sync Workflow instance.
- **Web Analytics**: enabled on the zone; the beacon renders from the root layout.

## Bindings & Vars

Bindings are declared in `apps/web/wrangler.jsonc`. The following secrets/vars
must be set on the Worker (via `wrangler secret put <NAME>` or the dashboard):

- `NOTION_TOKEN`: Notion integration token.
- `NOTION_POSTS_DB_ID`, `NOTION_PROJECTS_DB_ID`, `NOTION_PHOTOS_DB_ID`,
  `NOTION_PAGES_DB_ID`: Notion database IDs.
- `JOBS_SECRET`: at least 32 chars, authorizes `/api/jobs/sync-content`. Also read
  by the sync Workflow to call that route through the self service-binding.
- `SITE_URL`: production origin, e.g. `https://paulrdrs.com`.
- `CF_BEACON_TOKEN`: Cloudflare Web Analytics site token (from the dashboard after
  enabling Web Analytics for the domain). When unset, the beacon is not rendered.

Local development reads these from `apps/web/.env` / `apps/web/.dev.vars`;
`next dev` picks up the D1/R2 bindings through
`initOpenNextCloudflareForDev()` in `apps/web/next.config.ts`.

## First-Time Setup

1. `wrangler d1 create paulrdrs` and copy the returned `database_id` into the
   `d1_databases` block in `apps/web/wrangler.jsonc` (replacing the local
   placeholder).
2. `wrangler r2 bucket create paulrdrs-media`.
3. Set the secrets/vars listed above.
4. Enable Web Analytics for the domain and set `CF_BEACON_TOKEN`.

## Build, Migrate, Deploy

- Build (worker bundle): `pnpm build:worker` (or `pnpm build` for a plain Next build).
- Apply migrations to remote D1: `pnpm db:migrate:remote`
  (`wrangler d1 migrations apply DB --remote`). Local: `pnpm db:migrate`.
- Deploy: `pnpm deploy` (`opennextjs-cloudflare build && ... deploy`).

Migrations are SQLite files under `drizzle/`, generated with `pnpm db:generate`
and applied by wrangler (not `drizzle-kit migrate`).

## Notion Content Sync

`POST /api/jobs/sync-content` reads the Posts, Projects, Photos, and Pages Notion
databases and upserts them into D1, keyed by `notionPageId`. It is guarded by
`JOBS_SECRET`. An optional `?type=posts|projects|photos|pages` syncs a single
database. The response always includes the per-database sync summary; if any
entry fails, the route returns HTTP 500 so the Workflow step is marked failed
instead of silently accepting a partial sync. Unsupported or repeated `type`
parameters return HTTP 400 without running any database sync.

The primary trigger is the **cron trigger**, whose `scheduled` handler creates a
`NotionSyncWorkflow` instance. The Workflow runs one durable, independently
retried step per database, each calling the route through the worker's own
`WORKER_SELF_REFERENCE` service binding, so the sync always runs inside a real
request context. Two-second pauses separate the database steps to moderate
Notion request bursts; there is no pause after the final step. The route can
still be POSTed manually with the secret to force a sync.

## Production Smoke Test

After deploying a change that touches content, media, migrations, or the sync:

1. Open `/` and confirm the public homepage loads.
2. Trigger `POST /api/jobs/sync-content` with the `JOBS_SECRET` (or run the
   Workflow) and confirm it upserts content.
3. Publish or edit a post in Notion, re-run the sync, and confirm it renders at
   `/blog/[slug]`.
4. Confirm a Notion image re-hosts to R2 and renders through `/media/[id]`.
5. Confirm `/photo` lists published photos, `/photo/[slug]` renders the image and
   story, and linked photography projects show their photo grids.
6. Confirm the Web Analytics beacon loads (not blocked by CSP) and views appear
   in the Cloudflare dashboard.
