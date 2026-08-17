# Architecture

This is a pnpm workspace with four application and shared packages:

- `apps/web` (`@paulrdrs/web`) is the public Next.js application, deployed as
  the Railway `web` service.
- `workers/notion-sync` (`@paulrdrs/notion-sync`) is the private Railway cron
  command that reads Notion and writes content to PostgreSQL and a Bucket.
- `packages/content` (`@paulrdrs/content`) owns runtime-neutral normalized block
  trees and shared content contracts.
- `packages/database` (`@paulrdrs/database`) owns the Drizzle schema,
  configuration, migration history, and generation tooling. It depends on
  `@paulrdrs/content` for persisted content types.

The web app reads PostgreSQL and proxies media from the private Railway Bucket.
Notion is never on the
visitor request path, and there is no dashboard or authenticated surface.

## Stack

- Next.js App Router with React and TypeScript.
- pnpm for package management.
- Tailwind CSS for styling.
- Vitest for tests.
- Drizzle ORM with Railway PostgreSQL for durable data.
- Railway Bucket for private, S3-compatible media storage.
- A separate Railway cron service runs the Notion sync every five minutes.
- `@notionhq/client` for reading the Notion content databases during sync.

## Source Files

Application and package code uses `.ts` and `.tsx`. Plain JavaScript is not
allowed unless an unavoidable tool configuration has no TypeScript form. Those
narrow exceptions are documented directly in `.gitignore`, which prevents
accidental JavaScript additions during normal Git workflows.

Dependency versions are pinned exactly. Add or update dependencies with `pnpm`
so the workspace's `save-exact=true` configuration writes exact versions instead
of semver ranges.

## Data Domains

- Content: posts, photography projects, software projects, photos, keyed pages,
  photography-project/photo relationships,
  and media metadata, synced from Notion and keyed by `notionPageId`.
- Analytics: not collected by the application.
- Site settings: top navigation visibility (defaults when unset).

## Public Routes

- `/`
- `/blog`
- `/blog/[slug]`
- `/blog/tag/[tag]`
- `/photography`
- `/photography/[slug]`
- `/software`
- `/software/[slug]`
- `/store`
- `/contact`
- `/photo`
- `/photo/[slug]`
- `/media/[id]`
- `/robots.txt`
- `/sitemap.xml`

The `/store` route is intentionally minimal for now.

## Synchronization Boundary

The sync service has no public route or custom domain. Every five minutes
Railway starts one parameterless Node command. It constructs its Notion,
PostgreSQL, and Bucket dependencies from environment variables, acquires a
PostgreSQL advisory lock, and runs posts, photography projects, software
projects, photos, and pages in order. Stages retry transient failures; a failed
run exits non-zero and the next cron run retries the full idempotent sync.

The web and cron services deploy independently. HTTP ingress and webhooks for
the sync service are out of scope.

Posts, Photography Projects, and Software Projects derive their preview and
detail hero from the first image
block in the Notion page body. The sync rehosts that image, stores its media ID
on the content row, and removes the block from the normalized body to prevent a
duplicate image on detail pages. No Notion `Cover` property or page-level cover
participates in this flow.

The Notion Home page contains up to three ordered native page links or linked
page mentions targeting published Posts, Photography Projects, or Software
Projects. Page sync resolves those Notion identities to PostgreSQL
content identities and stores them in `pages.metadata.featuredContent`; the Home
body is not rendered. This keeps the homepage curated while the Blog,
Photography, and Software routes remain full archives. Invalid Home selections
preserve the last valid
page row instead of partially updating its configuration.

There are no authenticated routes. Content editing happens in Notion (see
[Auth](./auth.md)).

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
