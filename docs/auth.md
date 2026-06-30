# Auth

There is **no authenticated surface**. The custom dashboard and its
passkey/WebAuthn sign-in were removed once content moved to Notion (see
[Content](./content.md)). The deployed app is the public site plus the guarded
Notion sync job — nothing requires a login.

## What this means

- No `/dashboard` routes, no login/logout, no passkey registration.
- No auth environment variables (`ADMIN_EMAIL_ALLOWLIST`,
  `PASSKEY_BOOTSTRAP_SECRET`, `PASSKEY_RP_ID`, `SESSION_SECRET`). These were
  removed from the `web` service.
- No session cookie. The only privileged endpoints are `/api/jobs/*`, which are
  authorized with the `JOBS_SECRET` shared secret, not a user session (see
  [Deployment](./deployment.md)).

## Editing content

Content is authored in Notion and synced to Postgres by the cron-triggered
`/api/jobs/sync-content` job. To change the site, edit the Notion databases — no
app-side authentication is involved.

## Legacy database tables

The `admin_passkeys`, `webauthn_challenges`, and `auth_sessions` tables still
exist in the database. No code reads or writes them; they are dropped by a
follow-up cleanup migration.
