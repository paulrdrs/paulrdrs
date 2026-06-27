# Local Development

## Environment Variables

Use a local `.env` file for values needed by `pnpm dev`, tests that load envs,
and local Drizzle commands. Railway can also provide variables with
`railway run`, but a local `.env` is usually simpler for repeated local work.

Core local values:

- `DATABASE_URL`: Railway private Postgres URL. This works inside Railway, but
  not from a local Mac because `postgres.railway.internal` is private network
  DNS.
- `DATABASE_PUBLIC_URL`: public Postgres proxy URL for local development and
  local migrations.
- `ADMIN_EMAIL_ALLOWLIST`: comma-separated dashboard admin email allowlist.
- `PASSKEY_BOOTSTRAP_SECRET`: at least 32 characters.
- `PASSKEY_RP_ID`: optional. Defaults to the `SITE_URL` hostname with leading
  `www.` removed.
- `SESSION_SECRET`: at least 32 characters.
- `ANALYTICS_SALT`: at least 32 characters, HMAC salt for visitor hashing.
- `SITE_URL`: local or production origin used for passkey origin checks and
  canonical/sitemap URLs.
- `STORAGE_ENDPOINT`
- `STORAGE_BUCKET`
- `STORAGE_ACCESS_KEY_ID`
- `STORAGE_SECRET_ACCESS_KEY`
- `STORAGE_REGION`

Do not expose storage secrets or database URLs through client-side env vars.

## Database URL Selection

Runtime database access uses:

- production: `DATABASE_URL`
- non-production: `DATABASE_PUBLIC_URL` when present, otherwise `DATABASE_URL`

This keeps Railway production on the private network while allowing local
development to connect through the public proxy.

Drizzle migrations follow the same practical rule locally: set
`DATABASE_PUBLIC_URL` in `.env`, then run migrations from the project root.

```sh
pnpm db:migrate
```

## Railway-Provided Variables

Use Railway-provided variables when you want to run a local command with the
linked Railway environment:

```sh
railway run --service web pnpm dev
```

If Railway provides a private `DATABASE_URL`, make sure the local command also
has `DATABASE_PUBLIC_URL` available or override the database URL for that
command so your machine can reach Postgres.

## Common Commands

```sh
pnpm dev
pnpm test
pnpm lint
pnpm typecheck
pnpm build
pnpm db:generate
pnpm db:migrate
```
