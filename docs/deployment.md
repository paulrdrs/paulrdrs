# Railway Deployment

Railway hosts the public Next.js `web` service, PostgreSQL, a private `media`
Bucket, and the private `notion-sync` cron service in one production
environment. Use the nearest available European region for all resources.

## Services

- `web`: persistent service. Its build and deployment settings are versioned in
  `apps/web/railway.json`; it builds only `@paulrdrs/web` and starts with
  `pnpm --filter @paulrdrs/web start`.
- `notion-sync`: cron service. Its build and cron settings are versioned in
  `workers/notion-sync/railway.json`; it builds only `@paulrdrs/notion-sync`,
  runs `pnpm --filter @paulrdrs/notion-sync sync:run`, and schedules
  `*/5 * * * *`.
- Run `pnpm db:migrate` as the web service's pre-deploy command. Deploy the
  web service before enabling the sync cron.

Do not set a service root directory: both services use workspace packages.

## Variables

Set `SITE_URL`, `DATABASE_URL`, `BUCKET_ENDPOINT`, `BUCKET_NAME`,
`BUCKET_ACCESS_KEY_ID`, and `BUCKET_SECRET_ACCESS_KEY` on `web`. Set the same
database and Bucket values plus `NOTION_TOKEN`, `NOTION_POSTS_DB_ID`,
`NOTION_PHOTOGRAPHY_PROJECTS_DB_ID`, `NOTION_SOFTWARE_PROJECTS_DB_ID`,
`NOTION_PHOTOS_DB_ID`, and `NOTION_PAGES_DB_ID` on `notion-sync`.

Also set `DATABASE_PUBLIC_URL=${{Postgres.DATABASE_PUBLIC_URL}}` on `web` for
local `railway run … pnpm dev`. The production web process ignores this value
and uses private `DATABASE_URL` instead.

The Bucket is private. The site is the only public media boundary through
`/media/[id]`.

## Cutover

1. Create the Railway resources and deploy both services to Railway's generated
   domain.
2. Run one full sync, then verify the content routes and re-hosted media.
3. Add the canonical custom domain in Railway and publish its records in the
   domain registrar's DNS.
4. Verify TLS, canonical metadata, `/robots.txt`, `/sitemap.xml`, and all
   public routes on the canonical domain.
5. Keep Cloudflare resources intact for rollback until the Railway deployment is
   stable. Delete them only through a separately approved cleanup.
