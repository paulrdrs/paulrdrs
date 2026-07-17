# Content And Media

Content is authored in **Notion** and synced into Cloudflare D1; the public site
renders from D1. There is no dashboard or in-app editor.

## Content Types

- Posts use a unique slug and render at `/blog/[slug]`.
- Projects use a category plus slug and render at
  `/projects/[category]/[slug]`.
- Photos render in the `/photo` gallery and at `/photo/[slug]`. Each photo can
  relate to multiple photography projects.
- Pages are keyed records, currently used for `home` and `contact`.
- Media assets store object metadata in D1 and objects in the R2 bucket.

Each type maps to a Notion database (Posts, Projects, Photos, Pages). Page
**properties** carry the metadata (title, slug, status, excerpt, SEO fields,
cover, publish date, and — for projects — category); the Notion **page body** is
the long-form content. See the [Notion Schema](./notion-schema.md) for the exact
property contract.

For Photos, the first image block in the Notion page body is the photograph and
is removed from the stored story body during sync. Remaining blocks become the
photo story. The `Projects` relation is stored as a many-to-many relationship;
linked photos appear on photography project pages and linked projects appear on
photo detail pages.

## Authoring And Sync

Editing happens in Notion. The `POST /api/jobs/sync-content` job reads the four
databases and upserts rows into D1, keyed by `notionPageId`. It runs as a
Cloudflare Workflow on a cron trigger (one durable step per database). Content
indexes remain dynamically rendered so builds do not require D1, but their
stable D1 reads are cached for five minutes. Post, project, and photo detail
pages use five-minute ISR. Sync prepares up to three entries concurrently while
persisting content rows in source order.
See
[Deployment](./deployment.md) for the Workflow and cron setup.

Slugs come from an explicit Notion `Slug` property, normalized via `createSlug`
and frozen on publish. Renames record the old slug so the dynamic route can
301-redirect an old URL to the current one.

## Publishing

Public reads only query records with `status = "published"` (Notion `Status` =
**Published**). Drafts sync but do not render on public routes.

## Rendering

Long-form content is the **Notion block tree** stored as JSON text and rendered by
a custom React block renderer (`NotionBlocks`), not Markdown. The renderer
supports a fixed whitelist of block types: paragraph, headings, bulleted and
numbered lists, quote, code, image, divider, callout, and toggle. Unknown block
types are skipped.

There is no raw HTML and no `dangerouslySetInnerHTML`: React escapes all text,
so rendering a known set of block components is the content-safety model. The
renderer reuses the `.markdown-content` typographic styles in
`apps/web/src/app/styles/markdown.css`.

## Homepage Hero

When the Home page has body content it becomes the typographic hero. The
optional featured-selection (`{ kind, id }` in the Home page's JSON metadata) is
not modeled in Notion yet; absent a selection, the published Home title and body
render as the hero.

## Navigation Visibility

Top-navigation link visibility (Blog, Projects, Photography, Software, Store) is
stored in site settings in D1 and falls back to defaults when unset. There
is no in-app editor for it; the matching public routes remain reachable by direct
URL regardless of link visibility.

## Media

Every image referenced by Notion — uploaded, external, or cover — is re-hosted
into the R2 bucket during sync (never hotlinked, since Notion presigned URLs
expire) and served through `/media/[id]`, which streams the object by media ID.
Re-hosting is idempotent via a stable `media_assets.sourceKey`. Media metadata
lives in D1; the R2 objects are served through the app. Next.js responsive image
requests are transformed by the Cloudflare Images binding, so list cards and
detail views receive appropriately sized variants instead of the original
object at every viewport size.
