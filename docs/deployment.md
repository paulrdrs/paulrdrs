# Railway Deployment

This site deploys to Railway from the `web` service in the `production`
environment. The project also needs a Railway Postgres service named `db` and a
Railway Storage Bucket for private media objects.

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
deployment starts. Drizzle Kit prefers `DATABASE_PUBLIC_URL` when present, then
falls back to `DATABASE_URL`. In Railway production, keep using the private
`DATABASE_URL` on the `web` service. For local migrations from a Mac, put the
public proxy URL in local `.env` as `DATABASE_PUBLIC_URL`.

If the migration command exits non-zero, Railway stops the deployment.

For local migrations after loading local `.env`:

```sh
pnpm db:migrate
```

For local migrations through the Railway CLI, use the public Postgres proxy:

```sh
railway run --service db pnpm db:migrate
```

For local development after loading local `.env`, `DATABASE_PUBLIC_URL` is used
when present so your Mac can connect through the public proxy while Railway
production keeps the private `DATABASE_URL`:

```sh
pnpm dev
```

For local development with Railway-provided variables, override the private
runtime database URL with the public proxy:

```sh
railway run --service web sh -c 'DATABASE_URL="$DATABASE_PUBLIC_URL" pnpm dev'
```

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
