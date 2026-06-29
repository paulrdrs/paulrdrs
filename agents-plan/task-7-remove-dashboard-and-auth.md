# Task 7 — Remove the dashboard + passkey auth

> Read [plan.md](./plan.md) and [principles.md](./principles.md) first.
> **Depends on tasks 1–5 being verified in production** (Notion-sourced content
> renders correctly). This is the only **destructive** task — do it last. Commit
> to the current branch.

## Goal

Delete the entire custom dashboard and passkey/WebAuthn auth now that content is
authored in Notion and stats are pushed to Notion. Reduce the codebase to: public
site + Notion sync job + stats job.

## Steps

### 1. Delete dashboard & auth code
- Remove `src/auth/*` (crypto, guards, session, tokens, passkeys, constants) and
  their tests.
- Remove all dashboard routes under `src/app/dashboard/**` (login, logout,
  `(protected)/**`, `passkeys/**`, including the passkey API routes).
- Remove dashboard-only components: `ContentEditor`, `PageEditor`,
  `RegisterPasskey`, `PasskeyLogin`, `PasskeySetup`.
- Remove dashboard-only CMS/write helpers: `src/cms/contentForms.ts` and the
  write helpers in [src/db/adminContent.ts](../src/db/adminContent.ts) that are
  now superseded by `src/notion/sync.ts`. Keep any read/media helpers still used
  by the sync job or public site.
- Remove the old Markdown renderer now that `body` is the source of truth:
  `src/components/MarkdownContent.tsx`, `src/components/MarkdownContent.test.tsx`,
  and (if its styles were migrated to the Notion renderer) `src/app/styles/markdown.css`.
- Remove the `body`-vs-`bodyMarkdown` fallback added in Task 3 (the shared helper
  in the content pages): render `body` only.

### 2. Remove dependencies
- `@simplewebauthn/server`, `@simplewebauthn/browser`, `react-markdown`,
  `remark-gfm` from `package.json`. Reinstall to update the lockfile.

### 3. Prune chrome / nav
- In [src/components/TopNavBar.tsx](../src/components/TopNavBar.tsx) remove the
  authenticated "Dashboard" link logic and the `getCurrentSession` usage.
- In [src/components/SiteFrame.tsx](../src/components/SiteFrame.tsx) remove the
  `/dashboard` special-casing (no dashboard routes remain).

### 4. Env cleanup
- Delete `authEnvsSchema` / `getAuthEnvs` and the now-unused `ADMIN_EMAIL_ALLOWLIST`,
  `PASSKEY_BOOTSTRAP_SECRET`, `PASSKEY_RP_ID`, `SESSION_SECRET`. Check
  `src/envs/client.ts` (auth cookie names) and remove if unused.
- Keep `SITE_URL` (`getSiteEnvs`), `ANALYTICS_SALT`, `STORAGE_*`, `DATABASE_URL`,
  and the `NOTION_*` / `JOBS_SECRET` from tasks 1 & 6.

### 5. Schema
- Drop `admin_passkeys`, `webauthn_challenges`, `auth_sessions` from
  [src/db/schema.ts](../src/db/schema.ts).
- Drop the now-unused `bodyMarkdown` column from `posts`, `projects`, `pages`
  (content lives in `body`). Make `notionPageId` `notNull` if every row is now
  Notion-sourced.
- Drop the `projects.links` column — only the legacy dashboard editor wrote it;
  Notion-sourced projects keep external links inline in the page body. Also
  remove `links` from `getPublishedProjectBySlug` ([src/db/content.ts](../src/db/content.ts))
  and the CTA-button section in the project route
  ([src/app/projects/[category]/[slug]/page.tsx](../src/app/projects/[category]/[slug]/page.tsx)).
- `pnpm db:generate`; `pnpm format` the generated `drizzle/meta/*`.

### 6. Docs
- Rewrite [docs/auth.md](../docs/auth.md) → "no dashboard auth" (or remove and
  delink from `docs/index.md`).
- Update [docs/architecture.md](../docs/architecture.md),
  [docs/content.md](../docs/content.md), [docs/deployment.md](../docs/deployment.md)
  for: Notion as the content source, the block-tree rendering model (no Markdown),
  removal of dashboard routes, and the two cron jobs.

## Acceptance criteria

- `git grep -i "passkey\|webauthn\|dashboard\|markdown\|getAuthEnvs"` returns
  nothing under `src/`.
- `pnpm build` shows no `/dashboard` routes.
- The public site, `/api/jobs/sync-content`, and `/api/jobs/push-stats` all still
  work end-to-end.
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass; the analytics
  ingestion route `/api/analytics/events` (public) is untouched and still works.

## Notes

- Don't start until the content sync (tasks 1–5) is confirmed live in production —
  this step removes the only other way to manage content.
- The public analytics beacon route is **not** part of the dashboard; leave it.
