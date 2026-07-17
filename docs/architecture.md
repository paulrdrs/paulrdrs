# Architecture

This is a Next.js App Router personal site deployed on Cloudflare Workers via
the OpenNext adapter. Content is authored in Notion and synced into Cloudflare
D1; the public site renders from D1. There is no dashboard or authenticated
surface.

## Stack

- Next.js App Router with React and TypeScript.
- `@opennextjs/cloudflare` to run the app on Cloudflare Workers.
- pnpm for package management.
- Tailwind CSS for styling.
- Vitest for tests.
- Drizzle ORM with Cloudflare D1 (SQLite) for durable data, via the `DB` binding.
- Cloudflare R2 for media, via the `BUCKET` binding.
- Cloudflare Images for responsive media transformations, via the `IMAGES`
  binding.
- Cloudflare Workflows + a cron trigger to run the Notion sync durably.
- `@notionhq/client` for reading the Notion content databases during sync.

## Data Domains

- Content: posts, projects, photos, keyed pages, project-photo relationships,
  and media metadata, synced from Notion and keyed by `notionPageId`.
- Analytics: handled externally by Cloudflare Web Analytics (a beacon in the
  root layout); there is no analytics data stored in the app.
- Site settings: top navigation visibility (defaults when unset).

## Public Routes

- `/`
- `/blog`
- `/blog/[slug]`
- `/projects`
- `/projects/photography`
- `/projects/software`
- `/projects/[category]/[slug]`
- `/store`
- `/contact`
- `/photo`
- `/photo/[slug]`
- `/media/[id]`

The `/store` route is intentionally minimal for now.

## Job Routes

- `/api/jobs/sync-content`: reads the Notion Posts, Projects, Photos, and Pages
  databases and upserts them into D1. Guarded by `JOBS_SECRET`. An optional
  `?type=posts|projects|photos|pages` syncs a single database; this is how the sync
  Workflow drives one durable step per database. Unsupported or repeated `type`
  parameters return HTTP 400 without starting a sync (see
  [Deployment](./deployment.md)).

The sync itself runs as a Cloudflare Workflow (`NotionSyncWorkflow`) launched by
a cron trigger, which calls this route per database through the worker's own
service binding.

There are no authenticated routes; the dashboard and passkey auth were removed
in favor of Notion authoring (see [Auth](./auth.md)).

## Content Safety

Long-form content is the Notion block tree rendered by a custom React block
renderer over a fixed whitelist of block types. There is no raw HTML and no
`dangerouslySetInnerHTML`, so React escapes all text; only re-hosted image URLs
are emitted. See [Content](./content.md).

Components should keep styling internal or expose semantic props such as
`variant` or `size`; avoid raw style or class props on reusable components.

## Presentation

The public site uses semantic Tailwind theme tokens for canvas, surface, text,
muted text, rules, and accent color. Light and dark palettes follow the
visitor's operating-system preference.

### Spacing Scale

Padding, margin, and gap utilities must use only Tailwind spacing values `1`,
`2`, `4`, `8`, `12`, or `16`. Use `mx-auto` when centering a constrained shell.
Do not introduce raw CSS spacing, arbitrary spacing utilities, negative spacing,
or additional scale values.
