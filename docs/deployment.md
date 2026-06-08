# Railway Deployment

This site deploys to Railway from the `web` service in the `production`
environment. The project also needs a Railway Postgres service named `db` and a
Railway Storage Bucket for private media objects.

## Services

- `web`: Next.js app.
- `db`: Railway Postgres for CMS content, sessions, magic links, and analytics.
- `bucket`: Railway Storage Bucket for uploaded media.

## Web Service Environment

Configure these variables on the `web` service:

- `DATABASE_URL`: Railway Postgres private database URL.
- `RESEND_API_KEY`: Resend API key for dashboard magic-link email.
- `RESEND_FROM_EMAIL`: sender address for dashboard magic-link email.
- `ADMIN_EMAIL_ALLOWLIST`: comma-separated dashboard admin email allowlist.
- `SESSION_SECRET`: at least 32 characters, used for sessions and analytics
  visitor hashing.
- `SITE_URL`: production site origin, for example `https://paulrdrs.com`.
- `STORAGE_ENDPOINT`: Railway bucket S3-compatible endpoint.
- `STORAGE_BUCKET`: Railway bucket name.
- `STORAGE_ACCESS_KEY_ID`: Railway bucket S3-compatible access key.
- `STORAGE_SECRET_ACCESS_KEY`: Railway bucket S3-compatible secret key.
- `STORAGE_REGION`: Railway bucket S3-compatible region.

Do not configure the storage values only on the bucket resource. The `web`
service reads them at runtime to upload media and proxy private objects.

## Build And Migrations

Railway uses `railway.json` for config-as-code:

- Build command: `pnpm build`.
- Pre-deploy command: `pnpm db:migrate`.
- Start command: `pnpm start`.

The pre-deploy command runs after the app image builds and before the new web
deployment starts. It uses the `DATABASE_URL` available to the `web` service.
If the migration command exits non-zero, Railway stops the deployment.

For local migrations through the Railway CLI, use the public Postgres proxy:

```sh
railway run --service db sh -c 'DATABASE_URL="$DATABASE_PUBLIC_URL" pnpm db:migrate'
```

For local development with Railway-provided variables:

```sh
railway run pnpm dev
```

## Production Smoke Test

After deploying a change that touches CMS, auth, media, storage, migrations, or
analytics, smoke test production in this order:

1. Open `/` and confirm the public homepage loads.
2. Open `/dashboard/login`, request a magic link with an allowlisted email, and
   confirm the email arrives.
3. Complete the magic-link callback and confirm `/dashboard` loads.
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
