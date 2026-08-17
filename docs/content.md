# Content And Media

Content is authored in **Notion** and synced into Railway PostgreSQL; the public
site renders from PostgreSQL. There is no dashboard or in-app editor.

## Content Types

- Posts use a unique slug and render at `/blog/[slug]`.
- Photography projects render at `/photography/[slug]`.
- Software projects render at `/software/[slug]`.
- Photos render in the `/photo` gallery and at `/photo/[slug]`. Each photo can
  relate to multiple photography projects.
- Pages are keyed records, currently used for `home` and `contact`.
- Media assets store object metadata in PostgreSQL and objects in the Railway
  Bucket.

Each type maps to a Notion database (Posts, Photography Projects, Software
Projects, Photos, Pages). Page
**properties** carry the metadata (title, slug, status, excerpt, SEO fields,
publish date); the source project database defines whether a project is
photography or software. The Notion **page body** is the
long-form content. See the [Notion Schema](./notion-schema.md) for the exact
property contract.

For Posts and Projects, the first image block becomes the preview and detail
hero image. It is removed from the stored block tree so the detail page renders
it only once. If the body has no image, the entry has no preview or hero image.
There is deliberately no Notion `Cover` property, and Notion page-level covers
are ignored.

For Photos, the first image block in the Notion page body is the photograph and
is removed from the stored story body during sync. Remaining blocks become the
photo story. The `Photography Projects` relation is stored as a many-to-many relationship;
linked photos appear on photography project pages and linked projects appear on
photo detail pages.

## Authoring And Sync

Editing happens in Notion. The private `@paulrdrs/notion-sync` Worker reads the
five databases and upserts rows directly into PostgreSQL, keyed by
`notionPageId`, while re-hosting media directly into the private Bucket. Its
five-minute Railway cron runs one idempotent, locked full sync. Content indexes
remain dynamically rendered so builds do not require PostgreSQL, but their
stable PostgreSQL reads are cached for
five minutes. Post, project, and photo detail pages use five-minute ISR. Sync
prepares up to three entries concurrently while persisting content rows in
source order. See [Deployment](./deployment.md) for the cron setup.

The normalized block-tree and content contracts live in
`@paulrdrs/content`; the Drizzle schema lives in `@paulrdrs/database`. The web
app reads those shared contracts but contains no Notion client or sync writer.

Slugs come from an explicit Notion `Slug` property and fall back to the title.
Every rename records the previous slug for a permanent redirect, including
renames made while content is a draft. Historical slugs remain reserved so a
different entry cannot reuse an old public URL.

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
and rich-text links are limited to HTTP, HTTPS, `mailto`, and `tel` protocols.
Rendering a known set of block components is the content-safety model. The
renderer reuses the `.markdown-content` typographic styles in
`apps/web/src/app/styles/markdown.css`.

## Homepage Content

The Notion Home page is visitor-facing content and retains its block order. A
native **Link to page** block targeting a published Post, Photography Project,
or Software Project renders as a featured card at that exact point in the page.
All other supported blocks render normally, so headings, paragraphs, images,
and cards can be interleaved freely. Inline links in rich text remain ordinary
links rather than cards.

The homepage card uses its target's preview image, content label, title,
excerpt, and public URL. Duplicate page-link blocks are allowed. A page link
whose target is missing, draft, or unsupported is omitted from the public page;
this does not cause the Home sync to fail. `/blog`, `/photography`, and
`/software` remain the complete content archives.

The Blog index uses the same post preview image derived from the first body
image. Posts without a first image render as text-only entries; there is no
separate cover field or fallback artwork.

## Navigation Visibility

Top-navigation link visibility (Blog, Photography, Software, Store) is
stored in site settings in PostgreSQL and falls back to defaults when unset. There
is no in-app editor for it; the matching public routes remain reachable by direct
URL regardless of link visibility.

## Media

Every image referenced by Notion — uploaded or external — is re-hosted
into the Railway Bucket during sync (never hotlinked, since Notion presigned URLs
expire) and served through `/media/[id]`, which streams the object by media ID.
Re-hosting is idempotent via a stable `media_assets.sourceKey`. Media metadata
lies in PostgreSQL, and deterministic object keys make concurrent syncs converge on
the same Bucket object. The app serves those objects through its media route.
`ContentImage` always uses the relative `/media/[id]` route. This keeps media
on the active web origin, whether that is Railway's temporary domain, the
canonical domain, or localhost. Next.js can optimize responsive requests on the
same service while the Bucket remains private.
