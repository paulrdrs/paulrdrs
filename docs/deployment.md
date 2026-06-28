# Railway Deployment

This site deploys to Railway from the `web` service in the `production`
environment. The project also needs a Railway Postgres service named `db` and a
Railway Storage Bucket for private media objects.

DNS for the domain is the only piece managed outside Railway (on Cloudflare);
everything else — app, database, and media storage — runs on Railway.

## Services

- `web`: Next.js app.
- `db`: Railway Postgres for CMS content, sessions, passkeys, and analytics.
- `bucket`: Railway Storage Bucket for uploaded media.

## Web Service Environment

Configure these variables on the `web` service:

- `DATABASE_URL`: Railway Postgres private database URL.
- `ADMIN_EMAIL_ALLOWLIST`: comma-separated dashboard admin email allowlist.
- `PASSKEY_BOOTSTRAP_SECRET`: at least 32 characters, used for initial passkey
  setup and manual re-bootstrap.
- `PASSKEY_RP_ID`: optional passkey relying party ID. Defaults to `SITE_URL`
  hostname with a leading `www.` removed.
- `SESSION_SECRET`: at least 32 characters, used to sign the session cookie.
- `ANALYTICS_SALT`: at least 32 characters, used as the HMAC salt for daily
  visitor hashing. Keep this distinct from `SESSION_SECRET`.
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

After deploying a change that touches CMS, auth, media, storage, migrations, or
analytics, smoke test production in this order:

1. Open `/` and confirm the public homepage loads.
2. Open `/dashboard/passkeys/setup`, register an allowlisted email with the
   bootstrap secret, and confirm `/dashboard` loads.
3. Log out and confirm `/dashboard/login` accepts the registered passkey.
4. Create or update a post and publish it.
5. Confirm the published post renders at `/blog/[slug]`.
6. Upload an image in `/dashboard/media`.
7. Select uploaded media as a post or project cover and confirm it renders
   through `/media/[id]`.
8. Visit a public page and confirm dashboard analytics records the view.

## Cookie Settings

Session cookies are HTTP-only, same-site lax, path-scoped to `/`, and secure in
production. Local development keeps the same cookie shape except `secure` is
disabled for non-HTTPS localhost workflows.
