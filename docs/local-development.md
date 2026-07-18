# Local Development

## Environment Variables

Data access (D1, R2) comes from Cloudflare **bindings**, not env vars — locally
these are provided by Miniflare via `initOpenNextCloudflareForDev()` in
`apps/web/next.config.ts`, so `pnpm dev` reaches a local D1/R2 with no connection
string. Use a local `apps/web/.env` / `apps/web/.dev.vars` file only for plain
secrets/vars:

- `SITE_URL`: local or production origin used for canonical/sitemap URLs.
- `NOTION_TOKEN`: Notion integration token used to read the Posts, Projects,
  Photos, and Pages databases.
- `NOTION_POSTS_DB_ID`: Notion database ID for the Posts database.
- `NOTION_PROJECTS_DB_ID`: Notion database ID for the Projects database.
- `NOTION_PHOTOS_DB_ID`: Notion database ID for the Photos database.
- `NOTION_PAGES_DB_ID`: Notion database ID for the Pages database.
- `JOBS_SECRET`: at least 32 characters, used to authorize requests to the
  `/api/jobs/*` endpoints.
- `CF_BEACON_TOKEN` (optional locally): Cloudflare Web Analytics token; the
  beacon is skipped when unset.

Do not expose secrets through client-side (`NEXT_PUBLIC_*`) env vars.

## Local Database (D1)

The `DB` binding points at a local SQLite database under `.wrangler/` for
`pnpm dev` and `wrangler dev`. Generate and apply migrations from the project
root:

```sh
pnpm db:generate        # regenerate from packages/database/src/schema.ts
pnpm db:migrate         # apply to local D1
pnpm db:migrate:remote  # apply to the remote D1 (deploy)
```

## Dependencies

Dependencies must pin an **exact** version — never a `^`/`~`/range. `.npmrc` sets
`save-exact=true` so `pnpm add <pkg>` pins automatically; do not hand-write a
range. Add app dependencies with `pnpm --filter @paulrdrs/web add <pkg>`.
`pnpm check:deps` (run in the pre-commit hook) checks every workspace manifest
and fails the commit on any non-exact specifier.

## TypeScript only

All code and scripts are TypeScript (`.ts`/`.tsx`) — Node 24 runs `.ts` files
directly, so even repo scripts (see `scripts/`) are `.ts`. Plain JavaScript
(`.js`/`.jsx`/`.cjs`/`.mjs`) is not allowed; the sole exception is a tool config
with no TypeScript form (e.g. `apps/web/postcss.config.mjs`), allowlisted in
`scripts/check-no-js.ts`. `pnpm check:no-js` (pre-commit) enforces this.

## Common Commands

Run these from the repository root; application commands delegate to
`@paulrdrs/web`:

```sh
pnpm dev
pnpm test
pnpm lint
pnpm typecheck
pnpm build
pnpm db:generate
pnpm db:migrate
```
