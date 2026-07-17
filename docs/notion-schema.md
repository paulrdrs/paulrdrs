# Notion Schema Contract

This is the source of truth for the five Notion databases read by the content
sync. Property names and types are exact because the mapper validates them at
the API boundary.

Database templates may preset `Status = Draft` and provide a body skeleton, but
the sync reads only database entries and their page bodies.

## Shared conventions

- `Status` must contain the options **Draft** and **Published**. Draft entries
sync to PostgreSQL but are excluded from public queries.
- `Published` is optional. Public lists sort by it, then by creation time.
- `Slug` is normalized by the sync Worker. When empty, it falls back to a
  slugified title. Previous slugs are retained for permanent redirects and
  reserved against reuse by another entry.
- `notionPageId` is the stable internal identity used for upserts and never
  appears in a public URL.
- Property values carry metadata; the Notion page body carries long-form content.
- Posts, Photography Projects, and Software Projects do not have or use a
  `Cover` property. Their first image
  block is the only preview/hero source; a Notion page-level cover is ignored.

## Posts

| Property | Notion type | Required | Application field |
| --- | --- | --- | --- |
| `Title` | Title | Yes | `title` |
| `Slug` | Text | No | `slug` |
| `Status` | Status | Yes | `status` |
| `Published` | Date | No | `publishedAt` |
| `Excerpt` | Text | No | `excerpt` |
| `Tags` | Multi-select | No | `tags` |
| `SEO Title` | Text | No | `seoTitle` |
| `SEO Description` | Text | No | `seoDescription` |

The page body becomes `body` and renders at `/blog/[slug]`. The first image
block found in body order is optional; when present, it becomes the post preview
and hero image after rehosting. The sync removes that block from the stored body
so it renders only once. Without an image block, the post renders without a
preview or hero image.

## Photography Projects

Photography Projects use the same properties as Posts except `Tags`. They do
not have a `Category` property because their database defines their content
type. External project links belong in the page body as normal links; there is
no structured Links property.

Photography projects render at `/photography/[slug]`. The first image block
found in body order is optional; when present, it becomes the project preview
and hero image after rehosting. The sync removes that block from the stored body
so it renders only once. Without an image block, the project renders without a
preview or hero image.

The reciprocal `Photos` relation in this database is useful for Notion
authoring but is not read by the sync Worker.

## Software Projects

Software Projects use the same property contract as Photography Projects and
likewise do not have a `Category` property. They render at `/software/[slug]`.
Software Projects have no relationship with Photos.

## Photos

| Property | Notion type | Required | Application field |
| --- | --- | --- | --- |
| `Title` | Title | Yes | `title` |
| `Slug` | Text | No | `slug` |
| `Status` | Status | Yes | `status` |
| `Published` | Date | No | `publishedAt` |
| `Excerpt` | Text | No | `excerpt` |
| `Photography Projects` | Relation to Photography Projects | No | many-to-many photography-project links |

The photograph must be the first image block found in the page body. During
sync, that block is rehosted and becomes `mediaId`; it is removed from the block
tree, and the remaining blocks become the photo story. A page without an image
is reported as a per-entry sync error. Photos render in `/photo` and at
`/photo/[slug]`.

## Pages

| Property | Notion type | Required | Application field |
| --- | --- | --- | --- |
| `Title` | Title | Yes | `title` |
| `Key` | Select | Yes | `key` |
| `Status` | Status | Yes | `status` |
| `Published` | Date | No | `publishedAt` |

`Key` must be **home** or **contact**. A Contact page body becomes `body`.

The Home page body is configuration rather than public copy. Add zero to three
Notion page links (native **Link to page** blocks or linked text) pointing to
published Posts, Photography Projects, or Software Projects. Link order controls homepage order. Sync resolves
them into the Home row's ordered
`metadata.featuredContent` array and stores an empty Home body. Duplicate links,
more than three links, or links to missing, draft, or unsupported pages are
reported as a per-entry sync error; the last valid Home row is preserved.

## Supported body blocks

The renderer supports `paragraph`, `heading_1`, `heading_2`, `heading_3`,
`bulleted_list_item`, `numbered_list_item`, `quote`, `code`, `image`, `divider`,
`callout`, and `toggle`, including supported nested children. `link_to_page` and
Notion-page URLs in rich text are accepted as Home feature configuration and are
not rendered as Home body content.

Unknown blocks are skipped. Columns, tables, bookmarks, embeds, and equations
are not currently rendered.

## Media

Every uploaded or externally referenced Notion body image is downloaded during
sync and copied unchanged into the Railway Bucket. Notion database `Cover` properties
and page-level covers are not part of the content contract. The site serves
rehosted images through `/media/[id]`; Notion is never on the visitor request
path. Rehosting is idempotent via `media_assets.sourceKey`.
Concurrent syncs use the same deterministic Bucket object key and recover the media
row created by another Worker isolate.

Accepted media types are JPEG, PNG, WebP, and GIF, with a maximum size of 5 MiB.
SVG is intentionally rejected because it can contain executable content.
