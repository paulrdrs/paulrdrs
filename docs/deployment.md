# Cloudflare Deployment

The public site and Notion synchronization deploy as independent Cloudflare
Workers that share the D1 database and media R2 bucket.

## Workers And Resources

- `apps/web` (`@paulrdrs/web`) deploys through OpenNext as Worker `web`.
  Its entrypoint is the generated `apps/web/.open-next/worker.js`. It reads D1
  through `DB`, reads media through `BUCKET`, uses `IMAGES` for responsive
  variants, and stores ISR data in `NEXT_INC_CACHE_R2_BUCKET`.
- `workers/notion-sync` (`@paulrdrs/notion-sync`) deploys as Worker
  `notion-sync`. It owns the `*/5 * * * *` cron, the `notion-sync`
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
- Variables `NOTION_POSTS_DB_ID`, `NOTION_PHOTOGRAPHY_PROJECTS_DB_ID`,
  `NOTION_SOFTWARE_PROJECTS_DB_ID`, `NOTION_PHOTOS_DB_ID`, and
  `NOTION_PAGES_DB_ID`: the five Notion database IDs.

The sync Workflow validates all six values plus its D1 and R2 bindings when it
starts. The web Worker has no Notion configuration, Workflow binding, or service
binding to the sync Worker.

Both Wrangler configurations pin the `paulrdrs` Cloudflare account. Keep that
account ID explicit: without it, Wrangler cannot safely choose among the
authenticated accounts in a non-interactive deployment.

## Build, Migrate, And Deploy

Run commands from the repository root:

```sh
pnpm build:web           # OpenNext dry-run build of the public app Worker
pnpm build:sync          # Wrangler dry-run build of the sync Worker
pnpm run deploy:web      # public app only
pnpm run deploy:sync     # sync Worker only
pnpm db:generate         # generate migrations in the database package
pnpm db:migrate          # local D1 migrations
pnpm db:migrate:remote
```

Migrations are generated under `packages/database/drizzle/` with
`pnpm db:generate`. Apply a required remote migration before deploying code
that depends on it.

## Automatic Production Deployments

Cloudflare Workers Builds connects both Workers directly to the GitHub
repository. Each Worker has its own build connection because Cloudflare scopes
a connected build to that Worker. Both connections watch the production branch
`feat/cloudflare`; GitHub Actions is not involved and non-production branch
builds are disabled.

The dashboard build configuration uses repository root `/` and these commands:

```sh
# web build command
pnpm lint && pnpm typecheck && pnpm test

# web deploy command
pnpm run deploy:web

# notion-sync build command
pnpm run build:sync

# notion-sync deploy command
pnpm run deploy:sync && pnpm run sync:trigger
```

The sync connection owns sync deployment and the recovery trigger. The web
connection owns the public application deployment. Do not deploy one Worker
through the other Worker's connected build.

## Notion Content Sync And Recovery

Every five minutes the sync Worker's `scheduled` handler creates one
parameterless full-sync Workflow. It runs posts, photography projects, software
projects, photos, and pages in order with a two-second pause between stages.
Each stage accesses Notion, D1,
and R2 directly. Entry failures are logged with the stage summary and thrown so
Cloudflare records and retries the failed Workflow step.

There is no HTTP or targeted-database trigger. For smoke tests or recovery,
start a parameterless full sync and inspect instances with Wrangler:

```sh
pnpm run sync:trigger
pnpm sync:instances
```

Cron is the primary trigger; the CLI trigger is for recovery and smoke tests.

## Release Sequence

A content-contract release is not complete when only the web Worker deploys.
Use this order whenever web rendering depends on new sync behavior:

```sh
pnpm run deploy:sync
pnpm run sync:trigger
pnpm sync:instances  # wait for the new instance to complete successfully
pnpm run deploy:web
```

## Production Smoke Test

1. Trigger one full Workflow and confirm posts, photography projects, software
   projects, photos, and pages each report a successful stage summary.
2. Publish or edit a post in Notion, run another full sync, and confirm it
   renders at `/blog/[slug]`.
3. Confirm a Notion image is re-hosted into R2 and renders through `/media/[id]`.
4. Confirm `/photo`, `/photo/[slug]`, `/photography`, `/photography/[slug]`,
   `/software`, `/software/[slug]`, and linked photography project grids.
5. Confirm the public Web Analytics beacon loads and views appear in the
   Cloudflare dashboard.
