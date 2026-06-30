# Architecture

This is a Next.js App Router personal site deployed on Railway. Content is
authored in Notion and synced into Postgres; the public site renders from
Postgres. There is no dashboard or authenticated surface.

## Stack

- Next.js App Router with React and TypeScript.
- pnpm for package management.
- Tailwind CSS for styling.
- Vitest for tests.
- Drizzle ORM with Railway Postgres for durable data.
- Railway Storage Bucket with S3-compatible credentials for media.
- `@notionhq/client` for reading the Notion content databases during sync.

## Data Domains

- Content: posts, projects, keyed pages, and media metadata, synced from Notion
  and keyed by `notionPageId`.
- Analytics: privacy-minimal public page view events and aggregate summaries.
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
- `/photo/[id]`
- `/media/[id]`

The `/store` route is intentionally minimal for now.

## Job Routes

- `/api/jobs/sync-content`: reads the Notion Posts, Projects, and Pages
  databases and upserts them into Postgres. Guarded by `JOBS_SECRET` and
  triggered by a Railway Cron Job (see [Deployment](./deployment.md)).
- `/api/analytics/events`: public, unauthenticated page-view beacon.

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
