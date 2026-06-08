# Personal Site CMS Plan

## Current Baseline

- Next.js App Router personal site.
- Package manager stays as pnpm.
- Tests stay on Vitest running on Node.
- Styling uses Tailwind CSS.
- Deployment target is Railway.
- Railway deployment config is tracked in `railway.json`.
- Railway CLI is installed locally via Homebrew, logged in, linked to project `paulrdrs.com`, production environment, service `web`.
- Railway CLI agent support is enabled locally without MCP support.
- No Bun migration.
- No dashboard CMS, analytics, or media storage implementation yet.

## Architecture Decisions

- Use Railway Postgres for durable CMS content and internal analytics.
- Use Railway Postgres for passkey credentials, short-lived WebAuthn challenges, and sessions.
- Use Railway Storage Buckets for uploaded media.
- Use `railway.json` for schema-validated Railway deploy configuration.
- Use `STORAGE_*` environment variables on the `web` service for Railway bucket
  S3-compatible credentials.
- Use `railway run pnpm dev` for local development with Railway-provided environment variables when needed.
- For local Railway CLI migrations, use `railway run --service db sh -c 'DATABASE_URL="$DATABASE_PUBLIC_URL" pnpm db:migrate'` so Drizzle connects through the public Postgres proxy.
- Use SimpleWebAuthn for passkey/WebAuthn ceremonies.
- Keep lost-passkey recovery operational through direct database access.
- Grant admin access through an environment email allowlist.
- Store and render Markdown only; do not execute CMS-authored MDX.
- Keep `/store` as a blank/minimal route for now.
- Track privacy-minimal analytics only.
- Components should not accept raw style/class props. If a component needs visual variation, expose an explicit semantic prop such as `variant` or `size`.

## Route Plan

Public routes:

- `/blog`
- `/blog/[slug]`
- `/projects`
- `/projects/photography`
- `/projects/software`
- `/projects/[category]/[slug]`
- `/store`
- `/contact`

Dashboard routes:

- `/dashboard`
- `/dashboard/login`
- `/dashboard/passkeys/setup`
- `/dashboard/passkeys`
- `/dashboard/posts`
- `/dashboard/projects`
- `/dashboard/pages`
- `/dashboard/media`

## Railway Service Prerequisites

- Task 6 Postgres prerequisite is satisfied: Railway `db` Postgres service exists and `DATABASE_URL` is available on the `web` service.
- Before Task 7, configure `ADMIN_EMAIL_ALLOWLIST`, `SESSION_SECRET`, `SITE_URL`, and `PASSKEY_BOOTSTRAP_SECRET` for passkey auth.
- Before Task 11, create a Railway Storage Bucket and configure its S3-compatible credentials.
- Remind the maintainer before starting each task that depends on a missing Railway service.

## Task Graph

## Progress Tracker

| Task | Status | Notes |
| --- | --- | --- |
| 1. Public Route Skeleton | Completed | Added public placeholder routes and converted top navigation to real `next/link` links. |
| 2. App Shell Cleanup | Completed | Removed the global hero from the root layout, rendered it only on the homepage, and introduced a shared public page container. |
| 3. Environment Schema Foundation | Completed | Added server-only env validation for Railway Postgres, maintainer allowlist, sessions, site URL, passkeys, and Railway Storage Buckets. |
| 4. Database Layer | Completed | Added Drizzle/Postgres setup, CMS and analytics schema, migration scripts, and initial migration. |
| 5. Markdown Rendering | Completed | Added safe Markdown rendering with GFM support plus slug and excerpt helpers. |
| 6. Public Content Reads | Completed | Public blog/project routes now read published content from Postgres and hide drafts by query. |
| 7. Passkey Dashboard Auth | Completed | Replaced magic links with SimpleWebAuthn passkeys, bootstrap setup, passkey management, WebAuthn challenges, sessions, and auth tests. |
| 8. Dashboard Shell + Protection | Completed | Added protected dashboard shell, navigation, empty admin sections, and session validation tests. |
| 9. CMS CRUD: Posts and Projects | Completed | Added dashboard list/create/edit flows for posts and projects with Markdown previews and publish controls. |
| 10. CMS CRUD: Pages | Completed | Added keyed page editing for home/contact and wired published CMS content into public home/contact routes with fallbacks. |
| 11. Media Management | Completed | Added Railway Bucket-backed media uploads, metadata listing, public proxy route, and cover media selection for posts/projects. |
| 12. Internal Analytics Events | Completed | Added privacy-minimal event normalization, recording endpoint, and public page instrumentation. |
| 13. Dashboard Analytics | Completed | Added read-only dashboard analytics metrics, top content/path summaries, and daily views. |
| 14. Railway Deployment Hardening | Completed | Added deployment docs, pre-deploy migrations, env guidance, production cookie coverage, and smoke-test checklist. |

### 1. Public Route Skeleton

Goal: Create the requested public route structure with minimal placeholder pages.

Depends on: none

Implement:

- Add `/blog`, `/projects`, `/projects/photography`, `/projects/software`, `/store`, and `/contact`.
- Update navigation links to point to real routes.
- Keep pages static placeholders.
- Do not add CMS, dashboard, auth, storage, analytics, or database work.

Tests:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

Completion criteria:

- All listed routes exist and build.
- Navigation links point to real routes.
- `/store` exists but remains intentionally minimal.

Status: Completed.

### 2. App Shell Cleanup

Goal: Make the layout ready for many pages without hardcoding hero/content globally.

Depends on: Task 1

Implement:

- Move the global hero out of `src/app/layout.tsx`.
- Render hero/content only where appropriate, starting with the homepage.
- Keep top navigation and footer global.
- Establish consistent public page container styles with a shared `PageContainer`.

Tests:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`

Completion criteria:

- Every route has global nav/footer.
- Public pages do not receive unwanted duplicated hero content.

Status: Completed.

### 3. Environment Schema Foundation

Goal: Add typed env support for Railway services before wiring implementations.

Depends on: Task 1

Implement:

- Extend server env schema with database, admin allowlist, session, site URL, passkey, and Railway bucket settings.
- Keep client env minimal and do not expose secrets.
- Update env schema tests.

Core server env keys:

- `DATABASE_URL`

Auth env keys, required starting Task 7:

- `ADMIN_EMAIL_ALLOWLIST`
- `SESSION_SECRET`
- `SITE_URL`
- `PASSKEY_BOOTSTRAP_SECRET`
- `PASSKEY_RP_ID` (optional)

Storage env keys, required starting Task 11:

- `STORAGE_ENDPOINT`
- `STORAGE_BUCKET`
- `STORAGE_ACCESS_KEY_ID`
- `STORAGE_SECRET_ACCESS_KEY`
- `STORAGE_REGION`

Tests:

- Unit tests for valid and invalid env parsing.
- `pnpm test`
- `pnpm typecheck`

Completion criteria:

- Required production env vars are validated.
- Secrets remain server-only.

Status: Completed.

### 4. Database Layer

Goal: Add Postgres access and migrations without using the database in routes yet.

Depends on: Task 3

Implement:

- Add Drizzle ORM and migration setup.
- Add tables for posts, projects, pages, media assets, and analytics events.
- Add migration scripts.
- Use unique slugs for posts and category plus slug uniqueness for projects.

Implementation notes:

- Runtime DB dependencies: `drizzle-orm`, `postgres`.
- Migration dependency: `drizzle-kit`.
- Drizzle config: `drizzle.config.ts`.
- Schema: `src/db/schema.ts`.
- Server-only client: `src/db/client.ts`.
- Generated migration: `drizzle/0000_narrow_spot.sql`.
- Scripts: `pnpm db:generate`, `pnpm db:migrate`.
- Postgres migrations should be run through Railway with `railway run pnpm db:migrate` once services/env vars are ready.
- From local development, use the db service public proxy for migrations: `railway run --service db sh -c 'DATABASE_URL="$DATABASE_PUBLIC_URL" pnpm db:migrate'`.

Tests:

- Typecheck schema definitions.
- Generate migrations and confirm stable output.
- `pnpm typecheck`
- `pnpm lint`

Completion criteria:

- Drizzle config and initial migration exist.
- Database schema covers planned CMS and analytics needs.

Status: Completed.

### 5. Markdown Rendering

Goal: Establish safe content rendering before building CMS editors.

Depends on: Task 4

Implement:

- Add a shared Markdown rendering component.
- Use Markdown with GitHub-flavored Markdown support.
- Do not allow raw HTML or executable MDX.
- Add shared slug and excerpt helpers.

Implementation notes:

- Dependencies: `react-markdown`, `remark-gfm`.
- Renderer: `src/components/MarkdownContent.tsx`.
- Helpers: `src/lib/content.ts`.
- Raw HTML is not enabled; do not add `rehype-raw` for CMS-authored content.
- Components should keep styling internal or expose semantic variants, not raw style/class props.

Tests:

- Unit tests for slug generation.
- Rendering tests for common Markdown cases.
- Test that raw HTML is not rendered as executable HTML.
- `pnpm test`
- `pnpm typecheck`

Completion criteria:

- Markdown rendering is reusable by public pages and dashboard previews.
- CMS-authored content cannot execute arbitrary code.

Status: Completed.

### 6. Public Content Reads

Goal: Replace placeholder blog and project pages with database-backed public pages.

Depends on: Tasks 4 and 5

Implement:

- `/blog` lists published posts.
- `/blog/[slug]` renders a published post or returns not found.
- `/projects` lists published projects.
- `/projects/photography` lists published photography projects.
- `/projects/software` lists published software projects.
- `/projects/[category]/[slug]` renders a published project or returns not found.
- Keep drafts hidden publicly.

Implementation notes:

- Core server env validation now only requires `DATABASE_URL`; auth and storage envs are validated by separate feature schemas.
- Public content query helpers live in `src/db/content.ts`.
- Public list/detail routes are dynamic and query only `status = "published"` records.
- The initial Railway Postgres migration was applied with `railway run --service db sh -c 'DATABASE_URL="$DATABASE_PUBLIC_URL" pnpm db:migrate'`.

Tests:

- Published content appears publicly.
- Draft content remains hidden.
- Missing slugs and invalid categories return not found.
- `pnpm test`
- `pnpm build`

Completion criteria:

- Public content routes read from Postgres.
- Draft visibility rules are enforced.

Status: Completed.

### 7. Passkey Dashboard Auth

Goal: Add maintainer-only login with passkeys.

Depends on: Task 3

Implement:

- Add `/dashboard/login`.
- Add `/dashboard/passkeys/setup`.
- Add `/dashboard/passkeys`.
- Add passkey sign-in flow.
- Only allow emails listed in `ADMIN_EMAIL_ALLOWLIST`.
- Store passkey credentials and short-lived WebAuthn challenges in Postgres.
- Use `PASSKEY_BOOTSTRAP_SECRET` for initial setup and manual re-bootstrap.
- Store server-side sessions in Postgres with an expiry timestamp.
- Add auth tables to the main Drizzle schema and cover them with normal Postgres migrations.
- Set signed HTTP-only secure session cookie.
- Validate sessions by reading Postgres.
- Add logout.

Tests:

- Allowed email can register a passkey with the bootstrap secret.
- Disallowed email cannot register a passkey.
- Expired or consumed challenge cannot be reused.
- Valid passkey authentication creates session cookie.
- Logout clears session.
- `pnpm test`
- `pnpm typecheck`

Completion criteria:

- Only maintainers with registered passkeys can obtain sessions.
- Sessions are validated server-side.

Status: Completed.

### 8. Dashboard Shell + Protection

Goal: Create protected admin dashboard structure.

Depends on: Task 7

Implement:

- Add `/dashboard` layout.
- Protect all dashboard routes behind session validation.
- Add dashboard navigation for overview, posts, projects, pages, and media.
- Add empty but reachable admin sections.
- Redirect unauthenticated users to `/dashboard/login`.

Tests:

- Unauthenticated dashboard access redirects.
- Authenticated dashboard access succeeds.
- `pnpm test`
- `pnpm build`

Completion criteria:

- Dashboard routes are protected.
- Admin shell exists without CMS behavior yet.

Status: Completed.

### 9. CMS CRUD: Posts and Projects

Goal: Make the dashboard able to manage core content.

Depends on: Tasks 5, 6, and 8

Implement:

- Add list, create, and edit flows for posts.
- Add list, create, and edit flows for projects.
- Fields include title, slug, excerpt, Markdown body, status, publish date, and SEO fields.
- Projects include category `photography` or `software`.
- Add preview rendering with the shared Markdown renderer.
- Publishing a record makes it visible on public routes.

Tests:

- Create draft post/project.
- Publish post/project.
- Update slug, title, body, and status.
- Draft content remains hidden publicly.
- Published content appears publicly.
- `pnpm test`
- `pnpm build`

Completion criteria:

- Maintainers can manage posts and projects end to end.

Status: Completed.

### 10. CMS CRUD: Pages

Goal: Allow maintainers to configure general site content.

Depends on: Task 8

Implement:

- Add dashboard editor for keyed pages, including `home` and `contact`.
- Store page content in Postgres.
- Use Markdown for editable long-form areas.
- Wire `/contact` to CMS content.
- Keep homepage editable enough for intro/about-style content.

Tests:

- Edit contact content.
- Public contact route reflects published content.
- Missing page falls back to a safe placeholder.
- `pnpm test`
- `pnpm build`

Completion criteria:

- General site content can be managed from the dashboard.

Status: Completed.

### 11. Media Management

Goal: Add upload and selection support using Railway Storage Buckets.

Depends on: Tasks 3, 4, and 8

Implement:

- Add server-only S3-compatible bucket client.
- Add dashboard media upload page.
- Store uploaded object metadata in `media_assets`.
- Add alt text and attribution fields.
- Serve public media through signed URLs or an app proxy because Railway buckets are private.
- Allow posts and projects to reference media assets.

Tests:

- Upload validates file type and size.
- Upload stores metadata.
- Media listing shows uploaded assets.
- Public media route or proxy returns the expected asset response.
- `pnpm test`
- `pnpm build`

Completion criteria:

- Maintainers can upload and reuse media assets.

Status: Completed.

### 12. Internal Analytics Events

Goal: Track privacy-minimal public content analytics.

Depends on: Tasks 4 and 6

Implement:

- Add analytics event recording endpoint or server action.
- Track path, content id/type where available, timestamp, referrer origin, coarse device category, and daily salted visitor hash.
- Do not store full IP, full user agent, or full referrer URL.
- Add lightweight public page instrumentation.

Tests:

- Event payload normalization.
- Full referrer is reduced to origin.
- Visitor hash changes by day and salt.
- Invalid payloads are rejected.
- `pnpm test`
- `pnpm typecheck`

Completion criteria:

- Public views are recorded without storing sensitive request details.

Status: Completed.

### 13. Dashboard Analytics

Goal: Surface internal analytics in `/dashboard`.

Depends on: Tasks 8 and 12

Implement:

- Add dashboard overview metrics for recent views, top posts, top projects, top paths, and daily views.
- Keep analytics read-only.
- Use aggregate queries from `analytics_events`.

Tests:

- Aggregation query tests with seeded events.
- Empty analytics state renders gracefully.
- `pnpm test`
- `pnpm build`

Completion criteria:

- Dashboard shows useful analytics summaries.

Status: Completed.

### 14. Railway Deployment Hardening

Goal: Make the app production-ready on Railway.

Depends on: Tasks 3, 4, 7, 11, and 12

Implement:

- Document required Railway services: Next app, Postgres, and Storage Bucket, plus passkey env vars.
- Document required env vars.
- Ensure `next build` works with Railway-provided envs.
- Add migration command guidance for deploys.
- Extend `railway.json` with a pre-deploy migration command after database migrations exist.
- Confirm cookies use secure settings in production.

Tests:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- Railway smoke test for login, dashboard, content publishing, media upload, and analytics recording.

Completion criteria:

- Deployment requirements are documented.
- Production smoke-test path is clear.

Status: Completed.

## Global Test Policy

Every task should end with the relevant subset of:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Tasks that add behavior should include focused tests before moving to dependent tasks.

## Implementation Rule

Advance one task at a time. Stop after each task and wait for explicit maintainer approval before starting the next task.
