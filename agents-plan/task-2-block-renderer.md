# Task 2 — Block renderer

> Read [plan.md](./plan.md) and [principles.md](./principles.md) first.
> Part of the content-sync milestone (tasks 1–5; see [plan.md](./plan.md)). **Depends on:** 1 (uses the
> block-tree types from `src/notion/types.ts`). Additive; commit to the current branch.

## Goal

Build the custom React renderer that turns a Notion block tree into the site's
markup — proven correct by unit tests. It is **not wired into any page yet** (3
does that), so this sub-task is fully isolated and safe.

## Steps

1. **`src/components/NotionRichText.tsx`** — render a Notion `rich_text[]` array to
   React: `<strong>`, `<em>`, `<s>`, inline `<code>`, and `<a>` for links (+
   color via class). Text is rendered as React children (auto-escaped). No raw
   HTML.
2. **`src/components/NotionBlocks.tsx`** — a Server Component that maps the block
   tree to markup with `switch(block.type)` over the **Standard block set**
   ([notion-schema.md](./notion-schema.md)), recursing into `block.children`:
   - `paragraph`, `heading_1/2/3`, `bulleted_list_item`, `numbered_list_item`
     (group consecutive list items into `<ul>`/`<ol>`), `quote`, `code`,
     `callout`, `toggle` (`<details>/<summary>`), `divider`.
   - `image` → render via the existing
     [ContentImage.tsx](../src/components/ContentImage.tsx) using the image's
     `/media/[id]` URL (the URL is produced in 4; the renderer just consumes it).
   - Unknown block type → render nothing.
3. **Styling** — reuse the existing `markdown-content` classes in
   [src/app/styles/markdown.css](../src/app/styles/markdown.css) so the
   typography matches. Wrap output in the same container element/class the current
   `MarkdownContent` uses.
4. **`blockTreeToPlainText(body)`** — add to [src/lib/content.ts](../src/lib/content.ts):
   walk the tree concatenating `rich_text` plain text, for metadata descriptions.
   Mirror the truncation behavior of the existing `createExcerpt`.

## Acceptance criteria

- Given a block tree (typed per 1), `NotionBlocks` renders each whitelisted block
  type and nests children correctly; unknown types render nothing.
- `NotionRichText` renders all supported marks and links.
- `blockTreeToPlainText` returns clean, truncated plain text.
- Nothing else in the app imports these yet (no page change).
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass.

## Tests (this is the heavily-tested sub-task)

- `NotionBlocks`: one case per whitelisted block type; list grouping; nested
  children (toggle/column); unknown type → empty. Use `@testing-library/react`
  like the existing component tests.
- `NotionRichText`: bold/italic/strike/code/link, and combined marks.
- `blockTreeToPlainText`: extraction + truncation, mirroring
  [src/lib/content.test.ts](../src/lib/content.test.ts) style.

## Notes

- Keep the renderer pure (input: block tree → output: markup). No data fetching
  here.
