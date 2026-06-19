# Dashboard Auth

Dashboard auth is passkeys-only. Email-based sign-in is not a runtime
requirement.

## Environment Variables

- `ADMIN_EMAIL_ALLOWLIST`: comma-separated list of email addresses that may
  register admin passkeys.
- `PASSKEY_BOOTSTRAP_SECRET`: protects initial setup and manual re-bootstrap
  after a database reset.
- `PASSKEY_RP_ID`: optional passkey relying party ID. Defaults to `SITE_URL`
  hostname with leading `www.` removed.
- `SESSION_SECRET`: signs the HTTP-only session cookie.
- `SITE_URL`: canonical origin used for WebAuthn origin verification.

## Setup Flow

Initial setup happens at `/dashboard/passkeys/setup`.

An allowlisted email plus the bootstrap secret can start WebAuthn registration.
Successful registration stores the credential in Postgres, creates a
server-side session, and sets the signed session cookie.

The bootstrap secret is not used for normal login.

## Login Flow

`/dashboard/login` starts a discoverable passkey authentication ceremony with
user verification required. After a verified assertion, the app updates passkey
metadata, creates a server-side session, and sets the existing session cookie.

Protected dashboard pages read the cookie, verify its signature with
`SESSION_SECRET`, and validate the token against the `auth_sessions` table.

While that session is valid, the public top navigation displays Dashboard as
its final link. Signed-out visitors do not see the link; direct dashboard access
still relies on the protected-route session check.

## Passkey Management

Signed-in admins can manage passkeys at `/dashboard/passkeys`.

Admins can register additional passkeys while signed in. Deleting a passkey is
allowed only when another passkey remains for that admin email.

## Recovery

There is no user-facing lost-passkey recovery flow. If all passkeys are lost,
recover operationally with Railway/Postgres access:

1. Clear or replace the affected `admin_passkeys` records.
2. Visit `/dashboard/passkeys/setup`.
3. Register a new passkey with an allowlisted email and
   `PASSKEY_BOOTSTRAP_SECRET`.

Keep the bootstrap secret out of client-side variables and rotate it if it is
shared too widely.
