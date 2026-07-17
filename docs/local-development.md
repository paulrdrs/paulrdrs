# Local Development

## Local Site With Production Content

The app runs as standard Next.js with Turbopack. It does not start Miniflare,
Wrangler, or a local database. Local development reads the Railway production
PostgreSQL database and private Bucket through Railway's environment injection:

```sh
railway run --service web -- pnpm dev
```

The web app is read-only. Do not run migrations or `sync:run` locally against
production data; those operations run in Railway.

Before using the short command for the first time, link the checkout to the
production environment once:

```sh
railway environment link production
```

`railway run` supplies the web service variables. During `next dev`, the site
uses `DATABASE_PUBLIC_URL`, which points at Railway's password-protected
PostgreSQL TCP proxy; deployed web instances continue to use the private
`DATABASE_URL` value.

## Configuration

The web service requires `DATABASE_URL`, `BUCKET_ENDPOINT`, `BUCKET_NAME`,
`BUCKET_ACCESS_KEY_ID`, `BUCKET_SECRET_ACCESS_KEY`, and `SITE_URL`. The sync
service additionally requires `NOTION_TOKEN` and the five Notion database IDs.
Never expose any of these values through `NEXT_PUBLIC_*` variables.

For local development, add `DATABASE_PUBLIC_URL=${{Postgres.DATABASE_PUBLIC_URL}}`
to the Railway `web` service. It is not used by deployed web instances.

## Commands

```sh
pnpm dev             # standard local Next.js development server
pnpm build:web       # production Next.js build
pnpm build:sync      # sync-command type check
pnpm db:generate     # generate PostgreSQL migrations
pnpm db:migrate      # apply PostgreSQL migrations (Railway pre-deploy only)
pnpm sync:run        # one full sync (Railway cron start command)
```
