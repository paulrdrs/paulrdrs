# Task 3 — Schema + page rendering integration

> Read [plan.md](./plan.md) and [principles.md](./principles.md) first.
> Part of the content-sync milestone (tasks 1–5; see [plan.md](./plan.md)). **Depends on:** 1, 2.
> Additive (dual-column body); the dashboard keeps working. Commit to the current branch.

## Goal

Add the database columns the sync will write, and wire the public pages to render
the Notion `body` block tree (via 2's `NotionBlocks`), **falling back to the
existing Markdown renderer** when `body` is absent. No Notion data exists yet, so
in practice everything still renders via Markdown after this task — but the site
is now ready to display Notion content the moment 5 writes it.

## Steps

1. **Schema** ([src/db/schema.ts](../src/db/schema.ts)):
   - Add `body` (`jsonb`, nullable) to `posts`, `projects`, `pages` — typed to the
     1 block-tree type via `.$type<...>()`. **Keep `bodyMarkdown`.**
   - Add a unique `notionPageId` (text, nullable) to `posts`, `projects`, `pages`.
   - Add a unique `sourceKey` (text) to `media_assets`.
   - Add `slugHistory` (`jsonb` `string[]`, default `[]`) to `posts` and
     `projects` — prior slugs, for 301 redirects (slug strategy in plan.md). Pages
     have fixed routes and need none.
   - `pnpm db:generate`; then `pnpm format` the generated `drizzle/meta/*`.
2. **Read queries** ([src/db/content.ts](../src/db/content.ts)): add `body` to the
   selections for the post/project/page getters (keep `bodyMarkdown` for now).
   Preserve the React `cache()` wrapping.
3. **Page rendering** — in [blog/[slug]](../src/app/blog/[slug]/page.tsx),
   [projects/[category]/[slug]](../src/app/projects/[category]/[slug]/page.tsx),
   [home](../src/app/page.tsx), [contact](../src/app/contact/page.tsx): render
   `body` with `<NotionBlocks>` when present, else the existing
   `<MarkdownContent>`. Keep this branching in one small shared helper/component
   so Task 7 can delete the Markdown arm in one place.
4. **Metadata** — update each `generateMetadata` to derive the description from the
   Notion excerpt property when set, else `blockTreeToPlainText(body)` when `body`
   exists, else the current Markdown-based `createExcerpt` fallback.
5. **Slug redirects** — add getters in [src/db/content.ts](../src/db/content.ts)
   that find a post/project whose `slugHistory` contains a requested slug (project
   also scoped by category). In the `[slug]` routes, when the primary published
   lookup misses, check the history getter and `permanentRedirect()` to the
   current slug URL; otherwise `notFound()`. (Redirect data is written by 4/5;
   this wires the read side.)
6. **Dashboard untouched:** the editors still write `bodyMarkdown`; do not change
   them. Confirm they still typecheck against the new schema (extra nullable
   columns shouldn't affect them).

## Acceptance criteria

- Migration adds `body`, `notionPageId`, `sourceKey`; existing Markdown content
  still renders unchanged (fallback path).
- A row with a `body` block tree (e.g. a seeded test value) renders via
  `NotionBlocks`; a row with only `bodyMarkdown` renders via `MarkdownContent`.
- Dashboard create/edit of posts/projects/pages still works.
- Requesting a slug that exists only in a row's `slugHistory` 301-redirects to the
  current slug URL; an unknown slug still 404s.
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass.

## Tests

- Update existing page tests' mocked rows to include `body: null` (fallback path)
  and add one case per content page where `body` is a small block tree → asserts
  `NotionBlocks` output is used.
- `[slug]` route: primary miss + history hit → `permanentRedirect` to current
  URL; primary miss + no history → `notFound`.
- `db/schema.test.ts`: table set unchanged; new columns covered if that test
  asserts columns.

## Notes

- Don't drop `bodyMarkdown` here — that happens in Task 7 once Notion is the
  source of truth in production.
