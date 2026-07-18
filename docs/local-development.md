# Local Development

## Workspace Packages

- `apps/web` (`@paulrdrs/web`): public Next.js/OpenNext application.
- `workers/notion-sync` (`@paulrdrs/notion-sync`): private scheduled sync Worker.
- `packages/content` (`@paulrdrs/content`): runtime-neutral content contracts.
- `packages/database` (`@paulrdrs/database`): shared Drizzle schema.

Root scripts orchestrate these packages without making the root an application
package.

## Local Configuration

The web app reads D1 and R2 through Cloudflare bindings provided by Miniflare via
`initOpenNextCloudflareForDev()` in `apps/web/next.config.ts`; it does not use a
database connection string. Its plain runtime values belong in
`apps/web/.env` / `apps/web/.dev.vars`:

- `SITE_URL`: local or production origin used for canonical and sitemap URLs.
- `CF_BEACON_TOKEN` (optional): Cloudflare Web Analytics token.

The sync Worker owns all Notion configuration. For `pnpm dev:sync`, put its
local values in `workers/notion-sync/.dev.vars`:

- `NOTION_TOKEN`
- `NOTION_POSTS_DB_ID`
- `NOTION_PROJECTS_DB_ID`
- `NOTION_PHOTOS_DB_ID`
- `NOTION_PAGES_DB_ID`

The Worker receives D1 as `DB` and R2 as `BUCKET` and constructs its clients
directly from those bindings. Do not put Notion values or `JOBS_SECRET` in the
web app, and do not expose secrets through `NEXT_PUBLIC_*` variables.

## Local Database (D1)

The `DB` binding points at local SQLite state under `.wrangler/`. Generate and
apply migrations from the repository root:

```sh
pnpm db:generate        # schema: packages/database/src/schema.ts
pnpm db:migrate         # apply to local D1
pnpm db:migrate:remote  # explicit production operation
```

## Dependencies

Dependencies must pin an exact version; never use `^`, `~`, or another range.
`.npmrc` sets `save-exact=true`. Add dependencies with the owning package filter,
for example `pnpm --filter @paulrdrs/web add <pkg>`. `pnpm check:deps` validates
the root and every `apps/*`, `packages/*`, and `workers/*` manifest.

## TypeScript Only

All code and scripts are TypeScript (`.ts`/`.tsx`). Node 24 runs repository
scripts directly. Plain JavaScript is disallowed except for unavoidable tool
configuration explicitly allowlisted in `scripts/check-no-js.ts`.
`pnpm check:no-js` checks the entire repository.

## Common Commands

Run these from the repository root:

```sh
pnpm dev              # public web app (same as dev:web)
pnpm dev:sync         # local sync Worker
pnpm build            # plain Next.js build (same as build:web)
pnpm build:worker     # OpenNext Worker build
pnpm build:sync       # sync Worker dry-run build
pnpm test             # all four workspace packages
pnpm typecheck        # all four workspace packages
pnpm lint
pnpm check:deps
pnpm check:no-js
pnpm deploy           # public app only (same as deploy:web)
pnpm deploy:sync      # sync Worker only
pnpm sync:trigger     # parameterless full-sync recovery
pnpm sync:instances   # inspect Workflow instances
```
