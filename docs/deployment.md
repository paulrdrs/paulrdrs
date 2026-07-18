# Cloudflare Deployment

The public site and Notion synchronization deploy as independent Cloudflare
Workers that share the D1 database and media R2 bucket.

## Workers And Resources

- `apps/web` (`@paulrdrs/web`) deploys through OpenNext as Worker `web`.
  Its entrypoint is the generated `apps/web/.open-next/worker.js`. It reads D1
  through `DB`, reads media through `BUCKET`, uses `IMAGES` for responsive
  variants, and stores ISR data in `NEXT_INC_CACHE_R2_BUCKET`.
- `workers/notion-sync` (`@paulrdrs/notion-sync`) deploys as Worker
  `notion-sync`. It owns the `*/15 * * * *` cron, the `notion-sync`
  Workflow resource through `SYNC_WORKFLOW`, D1 writes through `DB`, and media
  uploads through `BUCKET`.

The sync Worker explicitly disables `workers_dev` and preview URLs and has no
route, custom domain, `fetch` handler, or binding from the web app. HTTP ingress,
webhooks, and sync-specific analytics are out of scope. The public site's
Cloudflare Web Analytics beacon remains external to this synchronization
architecture.

## Configuration Ownership

Web Worker configuration lives in `apps/web/wrangler.jsonc`. Its runtime
variables are:

- `SITE_URL`: production origin, for example `https://paulrdrs.com`.
- `CF_BEACON_TOKEN`: optional Cloudflare Web Analytics site token. The beacon is
  omitted when this is unset.

After renaming the Worker in the Cloudflare dashboard, keep this configuration's
`name` set to the same value before the next deployment.

Sync Worker configuration lives in `workers/notion-sync/wrangler.jsonc`. Set
these only on `notion-sync`:

- Secret `NOTION_TOKEN`: the Notion integration token.
- Variables `NOTION_POSTS_DB_ID`, `NOTION_PROJECTS_DB_ID`,
  `NOTION_PHOTOS_DB_ID`, and `NOTION_PAGES_DB_ID`: the four Notion database IDs.

The sync Workflow validates all five values plus its D1 and R2 bindings when it
starts. The web Worker has no Notion configuration, Workflow binding, or service
binding to the sync Worker.

## Build, Migrate, And Deploy

Run commands from the repository root:

```sh
pnpm build:worker    # OpenNext dry-run build of the public app Worker
pnpm build:sync      # Wrangler dry-run build of the sync Worker
pnpm deploy          # public app only (same as deploy:web)
pnpm deploy:sync     # sync Worker only
pnpm db:generate     # generate migrations in the database package
pnpm db:migrate      # local D1 migrations
pnpm db:migrate:remote
```

Migrations are generated under `packages/database/drizzle/` with
`pnpm db:generate`. Apply a required remote migration before deploying code
that depends on it.

## Notion Content Sync And Recovery

Every 15 minutes the sync Worker's `scheduled` handler creates one
parameterless full-sync Workflow. It runs posts, projects, photos, and pages in
order with a two-second pause between stages. Each stage accesses Notion, D1,
and R2 directly. Entry failures are logged with the stage summary and thrown so
Cloudflare records and retries the failed Workflow step.

There is no HTTP or targeted-database trigger. For smoke tests or recovery,
start a parameterless full sync and inspect instances with Wrangler:

```sh
pnpm sync:trigger
pnpm sync:instances
```

Cron is the primary trigger; the CLI trigger is for recovery and smoke tests.

## Production Smoke Test

1. Open `/` and confirm the public homepage loads.
2. Trigger one full Workflow and confirm posts, projects, photos, and pages each
   report a successful stage summary.
3. Publish or edit a post in Notion, run another full sync, and confirm it
   renders at `/blog/[slug]`.
4. Confirm a Notion image is re-hosted into R2 and renders through `/media/[id]`.
5. Confirm `/photo`, `/photo/[slug]`, and linked photography project grids.
6. Confirm the public Web Analytics beacon loads and views appear in the
   Cloudflare dashboard.
