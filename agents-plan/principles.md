# Code Quality Principles

Reference this while implementing any task in this directory. These are "Clean
Code" fundamentals distilled for **Next.js (App Router) + strict TypeScript**,
tied to this repo's existing conventions. When in doubt, match the surrounding
code.

## Guiding rule

**Write code that reads like the code already here.** Match naming, file
structure, comment density (low — explain *why*, not *what*), and test style of
neighboring files before introducing anything new.

## Reuse before you write

- Search for an existing utility/function/pattern first. This codebase already
  has helpers for media storage, content queries, env validation, metadata, and
  analytics (see "Existing code to reuse" in [plan.md](./plan.md)). Prefer them.
- Don't duplicate logic. Extract a small shared helper instead of copy-paste.
- Don't add a dependency if the standard library or an existing dep covers it.

## TypeScript (strict)

- No `any`. No non-null assertions (`!`) unless provably safe with a comment.
  Prefer type inference over redundant annotations; annotate public function
  signatures and module boundaries.
- Model Notion blocks as a **discriminated union** keyed on `type`; switch
  exhaustively and handle the unknown case explicitly (skip + optional dev log).
- **Validate every external boundary with Zod**: env vars, incoming request
  bodies, and the shape of data coming back from the Notion API. Never trust
  external JSON as typed.
- Prefer `readonly` / immutable data; avoid mutating function arguments.
- Make illegal states unrepresentable (narrow types, unions over booleans-soup).

## Functions & structure

- Small, single-responsibility functions. Early returns over nested `if`s.
- Pure functions for logic (mappers, the block→React renderer, text extraction)
  so they're trivially testable; keep I/O (DB, Notion, S3) at the edges.
- One module = one concern. Co-locate by feature (`src/notion/*`,
  `src/media/*`, `src/db/*`).
- Names reveal intent: `PascalCase` components, `camelCase` functions/vars,
  files matching existing convention. No abbreviations that aren't already used.

## Next.js App Router

- **Server Components by default.** Add `"use client"` only when you need
  interactivity/hooks. Keep client bundles small.
- Any module that reads secrets, the DB, or storage must `import "server-only"`
  at the top (see existing `src/db/*`, `src/media/*`, `src/envs/server.ts`).
- Access env **only** through the `getXEnvs()` helpers in
  [src/envs/server.ts](../src/envs/server.ts) (Zod-validated). Never read
  `process.env` directly in feature code.
- Public content pages are `force-dynamic` and read Postgres per request — no
  manual revalidation needed. Wrap getters used by both `generateMetadata` and
  the page in React `cache()` to dedupe the request (pattern already in
  [src/db/content.ts](../src/db/content.ts)).
- Page-level SEO goes through `generateMetadata` + the shared
  [buildContentMetadata](../src/lib/metadata.ts) helper.

## Security

- **No raw HTML, no `dangerouslySetInnerHTML`.** Render the Notion block tree via
  React components so text is auto-escaped. Only a fixed whitelist of block types
  is rendered.
- **Re-host external media** (Notion presigned URLs expire) into the Railway
  bucket; serve via `/media/[id]`. Never hotlink third-party URLs.
- Guard job endpoints (`/api/jobs/*`) with `JOBS_SECRET`; compare with a
  constant-time check and return 401 on mismatch.
- Least privilege; keep secrets server-side; don't log secret values.

## Error handling

- Fail fast on programmer errors and on misconfigured env (Zod throws — good).
- For non-critical external calls on the request path, degrade gracefully (the
  analytics `trackPageView` try/catch in [src/analytics/server.ts](../src/analytics/server.ts)
  is the model). Background sync jobs should surface failures (non-zero / logged),
  not swallow them silently.
- Make sync idempotent: upsert by a stable key (`notionPageId`, media
  `sourceKey`) so re-runs don't duplicate rows or re-upload media.

## Styling

- Semantic Tailwind theme tokens (canvas/surface/text/muted/rule/accent). No raw
  `style`/`class` props on reusable components — expose `variant`/`size` instead.
- Spacing utilities only from the scale `1, 2, 4, 8, 12, 16` (see
  [docs/architecture.md](../docs/architecture.md)); no arbitrary spacing values.

## Testing

- Vitest, colocated `*.test.ts(x)`. Mirror existing patterns: `vi.mock("server-only", () => ({}))`,
  `vi.mock("@/db/client")`, `vi.mock("@/envs/server")` where needed.
- Unit-test the pure logic: property→row mappers, the block whitelist + rich-text
  renderer, and `blockTreeToPlainText`. Don't chase coverage on thin I/O wrappers.
- Keep the full suite green; add tests in the same commit as the code.

## Tooling & process

- Format with Biome (`pnpm format`); lint with `pnpm lint`; types with
  `pnpm typecheck`. All must pass plus `pnpm build` before a task is "done".
- Drizzle: change [src/db/schema.ts](../src/db/schema.ts), then `pnpm db:generate`.
  Never hand-edit generated SQL/snapshots; run `pnpm format` on the generated
  `drizzle/meta/*` files.
- Conventional Commits (commitlint is enforced). One task → one focused
  commit on the current branch (do not create a new branch).
- **Exact dependency versions only — never `^`/`~`/ranges.** `.npmrc` has
  `save-exact=true`, so `pnpm add <pkg>` pins automatically; never hand-write a
  range. The `pnpm check:deps` guard (run in pre-commit) fails on any non-exact
  spec.
- **TypeScript only — no `.js`/`.jsx`/`.cjs`/`.mjs`.** Write all code and scripts
  in `.ts`/`.tsx` (Node 24 runs `.ts` directly). The only exception is a tool
  config with no TypeScript form (e.g. `postcss.config.mjs`), which must be
  allowlisted in `scripts/check-no-js.ts`. The `pnpm check:no-js` guard (run in
  pre-commit) fails on any non-allowlisted JS file.
