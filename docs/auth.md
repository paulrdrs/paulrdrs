# Auth

There is **no authenticated surface**. The custom dashboard and its
passkey/WebAuthn sign-in were removed once content moved to Notion (see
[Content](./content.md)). The deployed web app is public and has no privileged
HTTP endpoint; the separate sync Worker is scheduled-only.

## What this means

- No `/dashboard` routes, no login/logout, no passkey registration.
- No auth environment variables (`ADMIN_EMAIL_ALLOWLIST`,
  `PASSKEY_BOOTSTRAP_SECRET`, `PASSKEY_RP_ID`, `SESSION_SECRET`). These were
  removed from the `web` service.
- No session cookie, `JOBS_SECRET`, or `/api/jobs/*` route. The private sync
  Worker has no HTTP ingress and receives its Notion credentials through its
  own Worker configuration (see [Deployment](./deployment.md)).

## Editing content

Content is authored in Notion and synced directly to Cloudflare D1 and R2 by the
cron-triggered `@paulrdrs/notion-sync` Worker. To change the site, edit the
Notion databases — no app-side authentication is involved.

## Legacy database tables

The `admin_passkeys`, `webauthn_challenges`, and `auth_sessions` tables still
exist in the database. No code reads or writes them; they are dropped by a
follow-up cleanup migration.
