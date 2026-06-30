# Content And Media

Content is authored in **Notion** and synced into Postgres; the public site
renders from Postgres. There is no dashboard or in-app editor.

## Content Types

- Posts use a unique slug and render at `/blog/[slug]`.
- Projects use a category plus slug and render at
  `/projects/[category]/[slug]`.
- Pages are keyed records, currently used for `home` and `contact`.
- Media assets store object metadata in Postgres and private objects in Railway
  Storage Bucket.

Each type maps to a Notion database (Posts, Projects, Pages). Page **properties**
carry the metadata (title, slug, status, excerpt, SEO fields, cover, publish
date, and — for projects — category); the Notion **page body** is the long-form
content. The full property → column contract lives in `agents-plan/notion-schema.md`.

## Authoring And Sync

Editing happens in Notion. The cron-triggered `POST /api/jobs/sync-content` job
reads the three databases and upserts rows into Postgres, keyed by
`notionPageId`. Public content routes are `force-dynamic`, so a synced change is
reflected on the next request — there is no separate revalidation step. See
[Deployment](./deployment.md) for the cron setup.

Slugs come from an explicit Notion `Slug` property, normalized via `createSlug`
and frozen on publish. Renames record the old slug so the dynamic route can
301-redirect an old URL to the current one.

## Publishing

Public reads only query records with `status = "published"` (Notion `Status` =
**Published**). Drafts sync but do not render on public routes.

## Rendering

Long-form content is the **Notion block tree** stored as `jsonb` and rendered by
a custom React block renderer (`NotionBlocks`), not Markdown. The renderer
supports a fixed whitelist of block types: paragraph, headings, bulleted and
numbered lists, quote, code, image, divider, callout, and toggle. Unknown block
types are skipped.

There is no raw HTML and no `dangerouslySetInnerHTML`: React escapes all text,
so rendering a known set of block components is the content-safety model. The
renderer reuses the `.markdown-content` typographic styles in
`src/app/styles/markdown.css`.

## Homepage Hero

When the Home page has body content it becomes the typographic hero. The
optional featured-selection (`{ kind, id }` in the Home page's JSON metadata) is
not modeled in Notion yet; absent a selection, the published Home title and body
render as the hero.

## Navigation Visibility

Top-navigation link visibility (Blog, Projects, Photography, Software, Store) is
stored in site settings in Postgres and falls back to defaults when unset. There
is no in-app editor for it; the matching public routes remain reachable by direct
URL regardless of link visibility.

## Media

Every image referenced by Notion — uploaded, external, or cover — is re-hosted
into the Railway Storage Bucket during sync (never hotlinked, since Notion
presigned URLs expire) and served through `/media/[id]`, which proxies the
private object by media ID. Re-hosting is idempotent via a stable
`media_assets.sourceKey`. Media metadata lives in Postgres; the bucket objects
are private.
