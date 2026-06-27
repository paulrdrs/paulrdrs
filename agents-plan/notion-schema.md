# Notion Schema Contract

The single source of truth for how the Notion workspace maps to the Postgres
content model. The sync ([task-4](./task-4-notion-fetch-and-mapping.md),
[task-5](./task-5-sync-and-endpoint.md)) reads **page properties + page body**.

## Authoring model

- Three Notion **databases**: Posts, Projects, Pages.
- A database's **properties** are the metadata section shown at the top of every
  page; the **page body** (blocks) is the content. The sync reads both.
- Each DB has a **database template** ("New Post" / "New Project" / "New Page")
  that pre-sets `Status = Draft` and a body skeleton. Templates are an authoring
  convenience only — the sync never reads the template, just the live page.

## Posts DB

| Notion property | Type | → column | Notes |
|---|---|---|---|
| Title | Title | `title` | |
| Slug | Text | `slug` | Required; normalized via `createSlug`; frozen on publish; renames → `slugHistory` + 301 |
| Status | Status | `status` | Options: **Draft**, **Published**. Only `Published` renders publicly |
| Excerpt | Text | `excerpt` | Optional; falls back to body plain-text for SEO description |
| Tags | Multi-select | `tags` | |
| Cover | Files | `coverMediaId` | Re-hosted to our bucket |
| SEO Title | Text | `seoTitle` | Optional |
| SEO Description | Text | `seoDescription` | Optional |
| Published | Date | `publishedAt` | |
| *(page body)* | blocks | `body` | Standard block set (below) |

## Projects DB

Same as Posts, with these differences:

| Notion property | Type | → column | Notes |
|---|---|---|---|
| Category | Select | `category` | Options: **photography**, **software** |
| Links | Text (multi-line) | `links` (`{label,url}[]`) | One `Label \| URL` per line; sync trims, validates each URL (zod), skips blank/invalid lines |
| *(no Tags)* | | | Projects don't use tags |

## Pages DB (home, contact)

| Notion property | Type | → column | Notes |
|---|---|---|---|
| Key | Select | `key` | Options: **home**, **contact** (unique route key) |
| Title | Title | `title` | |
| Status | Status | `status` | Draft/Published |
| Published | Date | `publishedAt` | |
| *(page body)* | blocks | `body` | |

**Deferred:** the homepage **hero selection** (`{kind,id}` featured
post/project/photo, stored in `pages.metadata`) is not modeled in Notion for v1.
The site falls back to a typographic hero when no selection exists, so this is a
later enhancement, not a blocker.

## Standard block set (v1 renderer)

`paragraph`, `heading_1`, `heading_2`, `heading_3`, `bulleted_list_item`,
`numbered_list_item`, `quote`, `code`, `image`, `divider`, `callout`, `toggle`.

Unknown block types are skipped. Multi-column layout, tables, bookmarks/embeds,
and equations are **out of scope for v1** (the "Rich" set) and can be added to the
renderer + types later without a data migration.

## Cross-cutting rules

- **Images:** every image (uploaded, external, cover) is re-hosted to the Railway
  bucket and served via `/media/[id]` — never hotlinked. Idempotent via
  `media_assets.sourceKey`. SVG is disallowed.
- **Internal key:** `notionPageId` maps a Notion page to its row; it never
  appears in a public URL.
