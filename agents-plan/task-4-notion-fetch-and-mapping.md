# Task 4 — Notion fetch + mapping + media re-host

> Read [plan.md](./plan.md) and [principles.md](./principles.md) first.
> Part of the content-sync milestone (tasks 1–5; see [plan.md](./plan.md)). **Depends on:** 1 (client +
> types), 3 (the columns to write). Additive; commit to the current branch.

## Goal

Build the pieces that turn one Notion page into everything we need to store: its
**block tree**, its **mapped row values**, and its **re-hosted media**. These are
unit-testable modules; the orchestration that writes to the DB is 5.

**Property contract:** follow [notion-schema.md](./notion-schema.md) exactly
(property names, types, Status options, Links format, category options).

## Steps

1. **`src/notion/blocks.ts`** — recursively fetch a page's block children via the
   client, handling pagination, into the 1 block-tree shape. For any block with
   children (toggle, column, list item), fetch and attach `children`. Skip blocks
   not in the whitelist. Be mindful of the ~3 req/s rate limit (sequential or
   small concurrency).
2. **`src/notion/media.ts`** — `rehostImage(url, sourceKey)`: check `media_assets`
   for `sourceKey`; if missing, download the URL, `uploadMediaObject` with
   `buildMediaObjectKey` ([src/media/upload.ts](../src/media/upload.ts)), insert
   the asset; return the media id. Rewrite the reference to `/media/[id]`. Respect
   [src/media/validation.ts](../src/media/validation.ts) (allowed mime types; SVG
   is disallowed). Reuse [src/media/storage.ts](../src/media/storage.ts).
   - **Re-host *every* image — uploaded, external, and covers — never hotlink.**
     Uploaded Notion files have expiring presigned URLs; external (URL-added)
     images don't expire but would be **blocked by our `img-src 'self'` CSP** if
     hotlinked. Both must live on our infra and be served via `/media/[id]`.
   - `sourceKey`: for an uploaded file, hash the underlying object path *without*
     the signed query string (stable across re-signs); for an external image,
     hash the URL itself. This keeps re-host idempotent.
   - Apply the same path to **cover images** (post/project cover / a Files
     property): re-host and set `coverMediaId` — not just inline image blocks.
3. **`src/notion/mapping.ts` (pure, the most test-worthy file)** — for each
   content type, map a Notion page's properties → the row values used by the
   upserts: title, slug, category (projects), excerpt, SEO fields, project links,
   page hero metadata, `status` (Status property → `draft`/`published`),
   `publishedAt`, and `notionPageId`. **Validate the Notion property shapes with
   Zod**; throw a clear error on a malformed page. Keep this free of I/O so it's
   trivially testable. Target the same validated column set described in
   [src/cms/contentForms.ts](../src/cms/contentForms.ts) and
   [src/cms/pages.ts](../src/cms/pages.ts).
   - **Slug rule (see plan.md):** read the explicit Notion `Slug` property and
     normalize it with `createSlug` ([src/lib/content.ts](../src/lib/content.ts)).
     If the `Slug` property is blank, fall back to `createSlug(title)`. Return the
     desired slug; the *freeze-on-publish* and rename/redirect bookkeeping happens
     in 5 against the stored row. Treat an empty result (e.g. title with no
     slug-able chars) as a malformed-page error.
   - **Project Links:** parse the multi-line `Links` text property — one
     `Label | URL` per line → `{ label, url }[]`. Trim each side, validate the URL
     with zod, and skip blank/invalid lines.

## Acceptance criteria

- `blocks.ts` returns a correctly nested block tree for a paginated page with
  child blocks (verified against a mocked client).
- `media.ts` re-hosts a new image (upload + insert) and is idempotent: a second
  call with the same `sourceKey` does not re-upload or duplicate the asset. Works
  for uploaded, external, and cover images; no output references a Notion URL.
- `mapping.ts` produces correct row values for posts/projects/pages, maps the
  Status property to `draft`/`published`, and rejects malformed pages.
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass.

## Tests

- `mapping.ts`: valid post/project/page → expected values; status mapping;
  missing optional props; malformed page throws. Slug: explicit `Slug` property is
  normalized; blank `Slug` falls back to `createSlug(title)`; un-sluggable input
  throws. (Primary coverage.)
- `media.ts`: new image uploads + inserts; existing `sourceKey` short-circuits.
  Mock `@/db/client` and `@/media/storage` per existing patterns.
- `blocks.ts`: pagination + child attachment with a mocked Notion client.

## Notes

- No DB writes of content rows here — that's 5. These modules are invoked by the
  sync orchestrator and by tests.
