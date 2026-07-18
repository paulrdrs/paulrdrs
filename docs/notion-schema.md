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
  slugified title. Previous published slugs are retained for permanent redirects.
- `notionPageId` is the stable internal identity used for upserts and never
  appears in a public URL.
- Property values carry metadata; the Notion page body carries long-form content.

## Posts

| Property | Notion type | Required | Application field |
| --- | --- | --- | --- |
| `Title` | Title | Yes | `title` |
| `Slug` | Text | No | `slug` |
| `Status` | Status | Yes | `status` |
| `Published` | Date | No | `publishedAt` |
| `Excerpt` | Text | No | `excerpt` |
| `Tags` | Multi-select | No | `tags` |
| `Cover` | Files & media | No | `coverMediaId` after rehosting |
| `SEO Title` | Text | No | `seoTitle` |
| `SEO Description` | Text | No | `seoDescription` |

The page body becomes `body` and renders at `/blog/[slug]`.

## Projects

Projects use the same properties as Posts except `Tags`, plus:

| Property | Notion type | Required | Application field |
| --- | --- | --- | --- |
| `Category` | Select | Yes | `category` |

`Category` must be either **photography** or **software**. External project links
belong in the page body as normal links; there is no structured Links property.
Projects render at `/projects/[category]/[slug]`.

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

Every uploaded or externally referenced Notion image, including post and project
covers, is downloaded during sync and copied unchanged into Cloudflare R2. The
site serves it through `/media/[id]`; Notion is never on the visitor request
path. Rehosting is idempotent via `media_assets.sourceKey`.

Accepted media types are JPEG, PNG, WebP, and GIF, with a maximum size of 5 MiB.
SVG is intentionally rejected because it can contain executable content.
