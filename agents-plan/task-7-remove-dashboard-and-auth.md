# Task 7 — Remove the dashboard + passkey auth

> Read [plan.md](./plan.md) and [principles.md](./principles.md) first.
> **Dependency satisfied:** tasks 1–5 are verified in production (Notion content
> renders live, synced every 5 min by the `notion-sync-cron` Railway service).
> This is the only **destructive** task. Do it **interactively, attended** — it
> runs a production DB migration that drops tables/columns (see ⚠️ below). Commit
> to the current branch.

## Goal

Delete the custom dashboard and passkey/WebAuthn auth now that content is authored
in Notion. Reduce the codebase to: public site + Notion sync job (+ stats job if
task 6 is done).

## ⚠️ Already done this session (don't redo)

- **`TopNavBar` no longer reads the session** — `getCurrentSession`/Dashboard-link
  logic was removed to unblock the production build. (So the public build no
  longer depends on auth env at all.)
- **`getSiteNavigationSettings`** now falls back to defaults if the DB is
  unreachable at build ([src/db/siteSettings.ts](../src/db/siteSettings.ts)) —
  keep this.
- **Railway env already pruned:** `ADMIN_EMAIL_ALLOWLIST`, `PASSKEY_BOOTSTRAP_SECRET`,
  `SESSION_SECRET` were removed from the `web` service. Auth env is gone from
  prod; this task removes the code/schema that referenced it.

## ⚠️ Destructive-migration prerequisite

Dropping `bodyMarkdown` (below) **permanently deletes the only remaining
Markdown-authored content** — the old dashboard post at `/blog/test`. Before
dropping the column, **either re-author that post in Notion** (then re-sync) **or
accept its removal**. Confirm with the user first. The migration is applied to
production by Railway's pre-deploy `pnpm db:migrate` on the next deploy — watch it.

## Steps

### 1. Delete dashboard & auth code
- Remove `src/auth/*` (crypto, guards, session, tokens, passkeys, constants) +
  tests.
- Remove all `src/app/dashboard/**` routes (login, logout, `(protected)/**`,
  `passkeys/**`, including the passkey API routes).
- Remove dashboard-only components: `ContentEditor`, `PageEditor`,
  `RegisterPasskey`, `PasskeyLogin`, `PasskeySetup`.
- Remove dashboard-only helpers: `src/cms/contentForms.ts` and the **write**
  helpers in [src/db/adminContent.ts](../src/db/adminContent.ts) superseded by
  `src/notion/sync.ts`. **Keep** `getDashboardMediaAsset` (used by the
  `/media/[id]` route) and anything the sync/media layer still imports; keep
  `src/cms/pages.ts` (`PageKey`/`isPageKey` are used by the Notion mapping).
- Remove `src/components/MarkdownContent.tsx` + its test, and the
  `body`-vs-`bodyMarkdown` fallback in [ContentBody.tsx](../src/components/ContentBody.tsx)
  (render `body` only).
- **Keep `src/app/styles/markdown.css`** — `NotionBlocks` reuses the
  `.markdown-content` classes; this stylesheet now styles the Notion renderer.

### 2. Remove dependencies
- `@simplewebauthn/server`, `@simplewebauthn/browser`, `react-markdown`,
  `remark-gfm` from `package.json` (the last two only after `MarkdownContent` is
  gone). Reinstall to update the lockfile (stays exact per `.npmrc`).

### 3. Prune chrome / nav
- `TopNavBar` is already done. In [SiteFrame.tsx](../src/components/SiteFrame.tsx)
  remove the `/dashboard` special-casing (no dashboard routes remain).

### 4. Env cleanup
- Delete `authEnvsSchema` / `getAuthEnvs` from [schemas.ts](../src/envs/schemas.ts)
  / [server.ts](../src/envs/server.ts). Check `src/envs/client.ts` (auth cookie
  names) and remove if unused.
- Keep `siteEnvsSchema`/`getSiteEnvs` (`SITE_URL`), `analyticsEnvsSchema`,
  `storageEnvsSchema`, `serverEnvsSchema`, and `notionEnvsSchema`
  (`NOTION_*`/`JOBS_SECRET`).

### 5. Schema + migration
- Drop `admin_passkeys`, `webauthn_challenges`, `auth_sessions` from
  [src/db/schema.ts](../src/db/schema.ts).
- Drop `bodyMarkdown` from `posts`, `projects`, `pages` (see ⚠️ above). Consider
  making `notionPageId` `notNull` once all rows are Notion-sourced.
- Drop the `projects.links` column (only the legacy editor wrote it; Notion
  projects keep links inline in the body). Also remove `links` from
  `getPublishedProjectBySlug` ([content.ts](../src/db/content.ts)) and the
  CTA-button section in the project route
  ([page.tsx](../src/app/projects/[category]/[slug]/page.tsx)).
- `pnpm db:generate`; `pnpm format` the generated `drizzle/meta/*`.

### 6. Docs
- Rewrite [docs/auth.md](../docs/auth.md) → "no dashboard auth" (or remove + delink
  from `docs/index.md`).
- Update [architecture.md](../docs/architecture.md), [content.md](../docs/content.md),
  [deployment.md](../docs/deployment.md): Notion is the content source, block-tree
  rendering (no Markdown), no dashboard routes, the sync (+ stats) cron jobs, and
  the now-shorter env list.

## Acceptance criteria

- `git grep -i "passkey\|webauthn\|getAuthEnvs\|MarkdownContent\|bodyMarkdown\|simplewebauthn"`
  returns nothing under `src/`. (Note: `markdown-content` / `markdown.css` legitimately
  remain — they style the Notion renderer.)
- `pnpm build` shows no `/dashboard` routes.
- The public site, `/api/jobs/sync-content` (+ `/api/jobs/push-stats` if present),
  and the public `/api/analytics/events` beacon all still work.
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass.

## Notes

- The public analytics beacon route is **not** part of the dashboard; leave it.
- Sizeable, single-session task. Expect large test fallout (many dashboard tests
  deleted; `ContentBody`/content/page tests updated). Run gates after each
  lettered step.
