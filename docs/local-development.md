# Local Development

## Workspace Packages

- `apps/web` (`@paulrdrs/web`): public Next.js/OpenNext application.
- `workers/notion-sync` (`@paulrdrs/notion-sync`): private scheduled sync Worker.
- `packages/content` (`@paulrdrs/content`): runtime-neutral content contracts.
- `packages/database` (`@paulrdrs/database`): Drizzle schema, configuration,
  migrations, and generation tooling.

Root scripts orchestrate these packages without making the root an application
package.

## Local Configuration

The web app reads D1 and R2 through Cloudflare bindings provided by Miniflare via
`initOpenNextCloudflareForDev()` in `apps/web/next.config.ts`; it does not use a
database connection string. Its plain runtime values belong in
`apps/web/.env` / `apps/web/.dev.vars`:

- `SITE_URL`: local or production origin used for canonical and sitemap URLs.
- `CF_BEACON_TOKEN` (optional): Cloudflare Web Analytics token.

The sync Worker owns all Notion configuration. For `pnpm dev:sync` or
`pnpm dev:all`, put its
local values in `workers/notion-sync/.dev.vars`:

- `NOTION_TOKEN`
- `NOTION_POSTS_DB_ID`
- `NOTION_PROJECTS_DB_ID`
- `NOTION_PHOTOS_DB_ID`
- `NOTION_PAGES_DB_ID`

The Worker receives D1 as `DB` and R2 as `BUCKET` and constructs its clients
directly from those bindings. Do not put Notion values in the web app, and do
not expose secrets through `NEXT_PUBLIC_*` variables.

## Local Database (D1)

The `DB` binding points at local SQLite state under `.wrangler/`. Generate and
apply migrations from the repository root:

```sh
pnpm db:generate        # writes packages/database/drizzle/
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
pnpm dev              # public web app
pnpm dev:sync         # local sync Worker on port 8787
pnpm dev:all          # web and sync Worker together
pnpm sync:local       # trigger the running local sync Workflow
pnpm build:web        # OpenNext web Worker build
pnpm build:sync       # sync Worker dry-run build
pnpm test             # all four workspace packages
pnpm typecheck        # all four workspace packages
pnpm lint
pnpm fix              # apply safe Biome lint and formatting fixes
pnpm typegen          # regenerate both Workers' Cloudflare types
pnpm check:deps
pnpm check:no-js
pnpm preview:web      # production-like local web Worker
pnpm deploy:web       # public app only
pnpm deploy:sync      # sync Worker only
pnpm sync:trigger     # parameterless full-sync recovery
pnpm sync:instances   # inspect Workflow instances
```

`pnpm dev` is sufficient for ordinary web development and does not require a
live Notion connection. Run `pnpm dev:sync` only when testing ingestion or when
you want to refresh the local content snapshot. Its Wrangler process shares the
web app's `apps/web/.wrangler/state` directory. With that process running,
`pnpm sync:local` creates one local Workflow instance that writes into the same
local D1 and R2 state. `pnpm dev:all` starts both long-running processes, but the
sync still runs only when triggered. Apply local migrations before the first
run with `pnpm db:migrate`.
