# Personal Site CMS Plan

## Current Baseline

- Next.js App Router personal site.
- Package manager stays as pnpm.
- Tests stay on Vitest running on Node.
- Styling uses Tailwind CSS.
- Deployment target is Railway.
- No Bun migration.
- No CMS, database, dashboard, auth, analytics, or media storage implementation yet.

## Architecture Decisions

- Use Railway Postgres for durable CMS content and internal analytics.
- Use Railway Redis/KV for short-lived magic-link tokens and sessions.
- Use Railway Storage Buckets for uploaded media.
- Use Resend for magic-link emails.
- Keep auth custom; do not add auth-specific libraries.
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
- `/dashboard/auth/callback`
- `/dashboard/posts`
- `/dashboard/projects`
- `/dashboard/pages`
- `/dashboard/media`

## Task Graph

## Progress Tracker

| Task | Status | Notes |
| --- | --- | --- |
| 1. Public Route Skeleton | Completed | Added public placeholder routes and converted top navigation to real `next/link` links. |
| 2. App Shell Cleanup | Completed | Removed the global hero from the root layout, rendered it only on the homepage, and introduced a shared public page container. |
| 3. Environment Schema Foundation | Pending | Resume here next; do not start without maintainer approval. |

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

- Extend server env schema with database, Redis/KV, Resend, admin allowlist, session, site URL, and Railway bucket settings.
- Keep client env minimal and do not expose secrets.
- Update env schema tests.

Tests:

- Unit tests for valid and invalid env parsing.
- `pnpm test`
- `pnpm typecheck`

Completion criteria:

- Required production env vars are validated.
- Secrets remain server-only.

### 4. Database Layer

Goal: Add Postgres access and migrations without using the database in routes yet.

Depends on: Task 3

Implement:

- Add Drizzle ORM and migration setup.
- Add tables for posts, projects, pages, media assets, and analytics events.
- Add migration scripts.
- Use unique slugs for posts and category plus slug uniqueness for projects.

Tests:

- Typecheck schema definitions.
- Generate migrations and confirm stable output.
- `pnpm typecheck`
- `pnpm lint`

Completion criteria:

- Drizzle config and initial migration exist.
- Database schema covers planned CMS and analytics needs.

### 5. Markdown Rendering

Goal: Establish safe content rendering before building CMS editors.

Depends on: Task 4

Implement:

- Add a shared Markdown rendering component.
- Use Markdown with GitHub-flavored Markdown support.
- Do not allow raw HTML or executable MDX.
- Add shared slug and excerpt helpers.

Tests:

- Unit tests for slug generation.
- Rendering tests for common Markdown cases.
- Test that raw HTML is not rendered as executable HTML.
- `pnpm test`
- `pnpm typecheck`

Completion criteria:

- Markdown rendering is reusable by public pages and dashboard previews.
- CMS-authored content cannot execute arbitrary code.

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

Tests:

- Published content appears publicly.
- Draft content remains hidden.
- Missing slugs and invalid categories return not found.
- `pnpm test`
- `pnpm build`

Completion criteria:

- Public content routes read from Postgres.
- Draft visibility rules are enforced.

### 7. Custom Magic-Link Auth

Goal: Add maintainer-only login without auth-specific libraries.

Depends on: Task 3

Implement:

- Add `/dashboard/login`.
- Add magic-link request flow.
- Only allow emails listed in `ADMIN_EMAIL_ALLOWLIST`.
- Store one-time login tokens in Railway Redis/KV with a short TTL.
- Send login email through Resend.
- Add `/dashboard/auth/callback` to exchange token for a session.
- Store sessions in Redis/KV.
- Set signed HTTP-only secure session cookie.
- Add logout.

Tests:

- Allowed email creates token and sends email.
- Disallowed email does not reveal account existence.
- Expired, missing, or used token fails.
- Valid token creates session cookie.
- Logout clears session.
- `pnpm test`
- `pnpm typecheck`

Completion criteria:

- Only maintainers can obtain sessions.
- Sessions are validated server-side.

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

### 14. Railway Deployment Hardening

Goal: Make the app production-ready on Railway.

Depends on: Tasks 3, 4, 7, 11, and 12

Implement:

- Document required Railway services: Next app, Postgres, Redis/KV, and Storage Bucket.
- Document required env vars.
- Ensure `next build` works with Railway-provided envs.
- Add migration command guidance for deploys.
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

## Global Test Policy

Every task should end with the relevant subset of:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Tasks that add behavior should include focused tests before moving to dependent tasks.

## Implementation Rule

Advance one task at a time. Stop after each task and wait for explicit maintainer approval before starting the next task.
