# Auth

There is **no authenticated surface**. Content editing happens in Notion (see
[Content](./content.md)). The deployed web app is public and has no privileged
HTTP endpoint; the separate sync Worker is scheduled-only.

## What this means

- No `/dashboard` routes and no login, logout, or registration flows.
- No authentication environment variables.
- No session cookie or privileged API route. The private sync Worker has no HTTP
  ingress and receives its Notion credentials through its own Worker
  configuration (see [Deployment](./deployment.md)).

## Editing content

Content is authored in Notion and synced directly to Railway PostgreSQL and a
private Bucket by the
cron-triggered `@paulrdrs/notion-sync` Worker. To change the site, edit the
Notion databases — no app-side authentication is involved.
