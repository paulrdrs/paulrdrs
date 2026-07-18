# Architecture

This is a pnpm workspace with four application and shared packages:

- `apps/web` (`@paulrdrs/web`) is the public Next.js/OpenNext application,
  deployed as the Cloudflare Worker `web`.
- `workers/notion-sync` (`@paulrdrs/notion-sync`) is the private scheduled
  Worker that reads Notion and writes content to Cloudflare D1 and R2.
- `packages/content` (`@paulrdrs/content`) owns runtime-neutral normalized block
  trees and shared content contracts.
- `packages/database` (`@paulrdrs/database`) owns the Drizzle schema,
  configuration, migration history, and generation tooling. It depends on
  `@paulrdrs/content` for persisted content types.

The web app reads D1 and serves media directly from R2. Notion is never on the
visitor request path, and there is no dashboard or authenticated surface.

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
- A separate Cloudflare Worker, Workflows, and a cron trigger to run the Notion
  sync durably.
- `@notionhq/client` for reading the Notion content databases during sync.

## Data Domains

- Content: posts, photography projects, software projects, photos, keyed pages,
  photography-project/photo relationships,
  and media metadata, synced from Notion and keyed by `notionPageId`.
- Analytics: handled externally by Cloudflare Web Analytics (a beacon in the
  root layout); there is no analytics data stored in the app.
- Site settings: top navigation visibility (defaults when unset).

## Public Routes

- `/`
- `/blog`
- `/blog/[slug]`
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

The sync Worker has no `fetch` handler, public route, custom domain, or service
binding to the web app. Every five minutes its cron handler creates one
parameterless `NotionSyncWorkflow`. The Workflow constructs its Notion, D1, and
R2 dependencies directly from Worker bindings and runs posts, photography
projects, software projects, photos, and pages in order. Wrangler's Workflow
trigger provides full-sync recovery;
there is no HTTP sync endpoint or targeted public trigger.

The two Workers deploy independently. HTTP ingress and webhooks for the sync
Worker are out of scope. Analytics uses the external Cloudflare Web Analytics
integration and is not part of the sync architecture.

Posts, Photography Projects, and Software Projects derive their preview and
detail hero from the first image
block in the Notion page body. The sync rehosts that image, stores its media ID
on the content row, and removes the block from the normalized body to prevent a
duplicate image on detail pages. No Notion `Cover` property or page-level cover
participates in this flow.

The Notion Home page contains up to three ordered native page links or linked
page mentions targeting published Posts, Photography Projects, or Software
Projects. Page sync resolves those Notion identities to D1
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
