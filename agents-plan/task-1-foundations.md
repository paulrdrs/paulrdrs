# Task 1 — Foundations & types

> Read [plan.md](./plan.md) and [principles.md](./principles.md) first.
> Part of the content-sync milestone (tasks 1–5; see [plan.md](./plan.md)). **Depends on:** nothing.
> Additive; commit to the current branch.

## Goal

Stand up the Notion integration's foundations: the dependency, validated env, a
typed Notion client, and the **block-tree type contract** that both the renderer
(2) and the sync (4) will import. Nothing renders or syncs yet.

## Steps

1. **Dependency:** add `@notionhq/client`.
2. **Env schema** — in [src/envs/schemas.ts](../src/envs/schemas.ts) add
   `notionEnvsSchema` with: `NOTION_TOKEN`, `NOTION_POSTS_DB_ID`,
   `NOTION_PROJECTS_DB_ID`, `NOTION_PAGES_DB_ID` (non-empty strings) and
   `JOBS_SECRET` (string, min 32). Follow the existing schema style.
3. **Env accessor** — in [src/envs/server.ts](../src/envs/server.ts) add
   `getNotionEnvs()` mirroring `getSiteEnvs`/`getStorageEnvs`.
4. **Client** — `src/notion/client.ts`: `import "server-only"`, export a lazily
   constructed Notion client built from `getNotionEnvs().NOTION_TOKEN` (singleton,
   like [src/media/storage.ts](../src/media/storage.ts)'s S3 client).
5. **Types** — `src/notion/types.ts`: a discriminated union for the block tree we
   store in `body` and a type for Notion `rich_text[]`. Cover the **Standard block
   set** from [notion-schema.md](./notion-schema.md): `paragraph`,
   `heading_1/2/3`, `bulleted_list_item`, `numbered_list_item`, `quote`, `code`,
   `image`, `divider`, `callout`, `toggle`. Each node carries its `children`
   array. This is the shared contract — keep it minimal and serializable (it's
   stored as `jsonb`). (Columns/tables/embeds are deferred "Rich" blocks.)
6. **Docs:** add the new env vars to [docs/deployment.md](../docs/deployment.md)
   and [docs/local-development.md](../docs/local-development.md).

## Acceptance criteria

- `getNotionEnvs()` validates and returns the Notion env; missing/short values
  fail fast.
- `src/notion/client.ts` and `src/notion/types.ts` exist and are imported nowhere
  yet (no behavior change to the site).
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass.

## Tests

- `notionEnvsSchema`: parses valid input; rejects missing token and a short
  `JOBS_SECRET` (mirror the existing tests in
  [src/envs/schemas.test.ts](../src/envs/schemas.test.ts)).

## Notes

- No schema change, no rendering, no sync here — this is the safe foundation the
  next sub-tasks build on.
