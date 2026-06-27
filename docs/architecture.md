# Architecture

This is a Next.js App Router personal site and CMS deployed on Railway.

## Stack

- Next.js App Router with React and TypeScript.
- pnpm for package management.
- Tailwind CSS for styling.
- Vitest for tests.
- Drizzle ORM with Railway Postgres for durable data.
- Railway Storage Bucket with S3-compatible credentials for uploaded media.
- SimpleWebAuthn for passkey/WebAuthn dashboard authentication.

## Data Domains

- CMS content: posts, projects, keyed pages, and media metadata.
- Auth: admin passkeys, short-lived WebAuthn challenges, and server-side
  sessions.
- Analytics: privacy-minimal public page view events and dashboard summaries.
- Site settings: dashboard-managed top navigation visibility.

## Public Routes

- `/`
- `/blog`
- `/blog/[slug]`
- `/projects`
- `/projects/photography`
- `/projects/software`
- `/projects/[category]/[slug]`
- `/store`
- `/contact`
- `/photo/[id]`
- `/media/[id]`

The `/store` route is intentionally minimal for now.

## Dashboard Routes

- `/dashboard`
- `/dashboard/login`
- `/dashboard/passkeys/setup`
- `/dashboard/passkeys`
- `/dashboard/home`
- `/dashboard/contact`
- `/dashboard/blog`
- `/dashboard/blog/posts`
- `/dashboard/projects`
- `/dashboard/media`
- `/dashboard/settings`

`/dashboard/blog` redirects to `/dashboard/blog/posts`. Home and Contact are
top-level dashboard editors backed by keyed page records; there is no dashboard
Pages index or legacy `/dashboard/posts` route.

Protected dashboard routes validate the signed session cookie against the
server-side session table and redirect unauthenticated requests to
`/dashboard/login`.

## Content Safety

CMS-authored content is Markdown only. Raw HTML and executable MDX are not part
of the rendering model.

Components should keep styling internal or expose semantic props such as
`variant` or `size`; avoid raw style or class props on reusable components.

## Presentation

The public site and dashboard share semantic Tailwind theme tokens for canvas,
surface, text, muted text, rules, and accent color. Light and dark palettes
follow the visitor's operating-system preference. Public chrome is hidden on
dashboard and passkey routes, which use their own compact navigation and layout.

### Spacing Scale

Padding, margin, and gap utilities must use only Tailwind spacing values `1`,
`2`, `4`, `8`, `12`, or `16`. Use `mx-auto` when centering a constrained shell.
Do not introduce raw CSS spacing, arbitrary spacing utilities, negative spacing,
or additional scale values.
