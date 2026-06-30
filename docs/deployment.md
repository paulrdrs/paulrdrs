# Railway Deployment

This site deploys to Railway from the `web` service in the `production`
environment. The project also needs a Railway Postgres service named `db` and a
Railway Storage Bucket for private media objects.

DNS for the domain is the only piece managed outside Railway (on Cloudflare);
everything else — app, database, and media storage — runs on Railway.

## Services

- `web`: Next.js app.
- `db`: Railway Postgres for content, media metadata, and analytics.
- `bucket`: Railway Storage Bucket for media.
- A Railway **Cron Job** service that POSTs `/api/jobs/sync-content` on a
  schedule (see below).

## Web Service Environment

Configure these variables on the `web` service:

- `DATABASE_URL`: Railway Postgres private database URL.
- `ANALYTICS_SALT`: at least 32 characters, used as the HMAC salt for daily
  visitor hashing.
- `SITE_URL`: production site origin, for example `https://paulrdrs.com`.
- `STORAGE_ENDPOINT`: Railway bucket S3-compatible endpoint.
- `STORAGE_BUCKET`: Railway bucket name.
- `STORAGE_ACCESS_KEY_ID`: Railway bucket S3-compatible access key.
- `STORAGE_SECRET_ACCESS_KEY`: Railway bucket S3-compatible secret key.
- `STORAGE_REGION`: Railway bucket S3-compatible region.
- `NOTION_TOKEN`: Notion integration token used to read the Posts, Projects,
  and Pages databases.
- `NOTION_POSTS_DB_ID`: Notion database ID for the Posts database.
- `NOTION_PROJECTS_DB_ID`: Notion database ID for the Projects database.
- `NOTION_PAGES_DB_ID`: Notion database ID for the Pages database.
- `JOBS_SECRET`: at least 32 characters, used to authorize requests to the
  `/api/jobs/*` endpoints (Railway Cron Jobs).

Do not configure the storage values only on the bucket resource. The `web`
service reads them at runtime to upload media and proxy private objects.

Do not add `DATABASE_PUBLIC_URL` to the production web service. It is only for
local development and local migrations from a machine that cannot resolve the
Railway private network hostname.

## Build And Migrations

Railway uses `railway.json` for config-as-code:

- Build command: `pnpm build`.
- Pre-deploy command: `pnpm db:migrate`.
- Start command: `pnpm start`.

The pre-deploy command runs after the app image builds and before the new web
deployment starts. In Railway production, Drizzle uses the private
`DATABASE_URL` on the `web` service.

If the migration command exits non-zero, Railway stops the deployment.

## Notion Content Sync Cron

`POST /api/jobs/sync-content` reads the Posts, Projects, and Pages Notion
databases and upserts them into Postgres, keyed by `notionPageId`. It is guarded
by `JOBS_SECRET` and is otherwise a plain `force-dynamic` route, so it can be
triggered manually or by a webhook later — but the primary trigger is a Railway
Cron Job:

1. In the Railway project, add a new service of type **Cron Job** (not a
   long-running worker or function — a full sync can run long under Notion's
   ~3 req/s rate limit, and a function could time out mid-sync).
2. Set its schedule to every ~15 minutes, for example `*/15 * * * *`.
3. Set its command to POST the endpoint with the secret, for example:
   ```
   curl -fsS -X POST https://<production-host>/api/jobs/sync-content \
     -H "x-jobs-secret: ${JOBS_SECRET}"
   ```
4. Give the cron service access to `JOBS_SECRET` (shared with the `web`
   service) so the value isn't duplicated.

The cadence is adjustable; 15 minutes balances content freshness against the
Notion rate limit for a full three-database sync.

## Production Smoke Test

After deploying a change that touches content, media, storage, migrations,
analytics, or the sync job, smoke test production in this order:

1. Open `/` and confirm the public homepage loads.
2. Trigger `POST /api/jobs/sync-content` with the `JOBS_SECRET` (or wait for the
   cron) and confirm it returns success.
3. Publish or edit a post in Notion, re-run the sync, and confirm it renders at
   `/blog/[slug]`.
4. Confirm a Notion image re-hosts and renders through `/media/[id]`.
5. Visit a public page and confirm analytics records the view.

## Analytics Beacon

The public `/api/analytics/events` beacon is unauthenticated and cookieless; it
records privacy-minimal page views. The app sets no session or auth cookies.
