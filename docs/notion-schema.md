# Notion Schema Contract

This is the source of truth for the four Notion databases read by the content
sync. Property names and types are exact because the mapper validates them at
the API boundary.

Database templates may preset `Status = Draft` and provide a body skeleton, but
the sync reads only database entries and their page bodies.

## Shared conventions

- `Status` must contain the options **Draft** and **Published**. Draft entries
  sync to D1 but are excluded from public queries.
- `Published` is optional. Public lists sort by it, then by creation time.
- `Slug` is normalized by the sync Worker. When empty, it falls back to a
  slugified title. Previous slugs are retained for permanent redirects and
  reserved against reuse by another entry.
- `notionPageId` is the stable internal identity used for upserts and never
  appears in a public URL.
- Property values carry metadata; the Notion page body carries long-form content.
- Posts and Projects do not have or use a `Cover` property. Their first image
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

## Projects

Projects use the same properties as Posts except `Tags`, plus:

| Property | Notion type | Required | Application field |
| --- | --- | --- | --- |
| `Category` | Select | Yes | `category` |

`Category` must be either **photography** or **software**. External project links
belong in the page body as normal links; there is no structured Links property.
Projects render at `/projects/[category]/[slug]`. The first image block found in
body order is optional; when present, it becomes the project preview and hero
image after rehosting. The sync removes that block from the stored body so it
renders only once. Without an image block, the project renders without a
preview or hero image.

## Photos

| Property | Notion type | Required | Application field |
| --- | --- | --- | --- |
| `Title` | Title | Yes | `title` |
| `Slug` | Text | No | `slug` |
| `Status` | Status | Yes | `status` |
| `Published` | Date | No | `publishedAt` |
| `Excerpt` | Text | No | `excerpt` |
| `Projects` | Relation to Projects | No | many-to-many project links |

The photograph must be the first image block found in the page body. During
sync, that block is rehosted and becomes `mediaId`; it is removed from the block
tree, and the remaining blocks become the photo story. A page without an image
is reported as a per-entry sync error. Photos render in `/photo` and at
`/photo/[slug]`.

The reciprocal `Photos` relation in the Projects database is useful for Notion
authoring but is not read by the sync Worker.

## Pages

| Property | Notion type | Required | Application field |
| --- | --- | --- | --- |
| `Title` | Title | Yes | `title` |
| `Key` | Select | Yes | `key` |
| `Status` | Status | Yes | `status` |
| `Published` | Date | No | `publishedAt` |

`Key` must be **home** or **contact**. The page body becomes `body`. The optional
homepage hero selection is stored in D1 metadata and is not currently authored
through a Notion property.

## Supported body blocks

The renderer supports `paragraph`, `heading_1`, `heading_2`, `heading_3`,
`bulleted_list_item`, `numbered_list_item`, `quote`, `code`, `image`, `divider`,
`callout`, and `toggle`, including supported nested children.

Unknown blocks are skipped. Columns, tables, bookmarks, embeds, and equations
are not currently rendered.

## Media

Every uploaded or externally referenced Notion body image is downloaded during
sync and copied unchanged into Cloudflare R2. Notion database `Cover` properties
and page-level covers are not part of the content contract. The site serves
rehosted images through `/media/[id]`; Notion is never on the visitor request
path. Rehosting is idempotent via `media_assets.sourceKey`.
Concurrent syncs use the same deterministic R2 object key and recover the media
row created by another Worker isolate.

Accepted media types are JPEG, PNG, WebP, and GIF, with a maximum size of 5 MiB.
SVG is intentionally rejected because it can contain executable content.
