# Task 6 — Stats → Notion digest job

> Read [plan.md](./plan.md) and [principles.md](./principles.md) first.
> **Depends on Tasks 1 & 5** (it reuses `getNotionEnvs` + the Notion client from
> task 1 and the `JOBS_SECRET`-guarded `/api/jobs/*` pattern from task 5).
> Additive; commit to the current branch.

## Goal

Every ~5 minutes, publish a digest of the site's analytics into a Notion database
so stats are visible in Notion. Raw analytics stays in Postgres; Notion holds
only the aggregated digest.

## Prerequisites / inputs (confirm with the user first)

- A Notion database for stats and its ID (`NOTION_STATS_DB_ID`).
- The desired property layout for that DB (what fields/rows to show — see the
  shape of `getDashboardAnalyticsSummary()` below).

## Steps

### 1. Env
- Add `NOTION_STATS_DB_ID` to `notionEnvsSchema`
  ([src/envs/schemas.ts](../src/envs/schemas.ts)) and `getNotionEnvs()`.
- Document it in [docs/deployment.md](../docs/deployment.md).

### 2. Stats publisher `src/notion/stats.ts`
- Call the existing `getDashboardAnalyticsSummary()` in
  [src/db/analytics.ts](../src/db/analytics.ts) (returns `recentViews`,
  `recentVisitors`, `topPaths`, `topPosts`, `topProjects`, `dailyViews`).
- Upsert that into the Notion stats DB. Choose a stable key so re-runs **update**
  rather than append (e.g. one row per metric keyed by a name property, or a
  single "latest snapshot" page updated in place). Keep writes minimal to respect
  the rate limit.
- Reuse the Notion client from `src/notion/client.ts` (task 1).

### 3. Trigger endpoint
- `POST /api/jobs/push-stats` — guard with `JOBS_SECRET` (constant-time check),
  call `src/notion/stats.ts`, return a small JSON summary. Mirror
  `/api/jobs/sync-content` from task 5.
- Add a **Railway Cron Job** service that POSTs this endpoint with `JOBS_SECRET`
  every ~5 min; document it in [docs/deployment.md](../docs/deployment.md).

## Acceptance criteria

- Hitting `/api/jobs/push-stats` with the secret writes the current
  `getDashboardAnalyticsSummary()` digest into the Notion stats DB.
- Re-running updates in place — no duplicate rows accumulate.
- Endpoint returns 401 without the secret.
- `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all pass.

## Tests

- The summary → Notion-properties mapping (pure function): given a
  `DashboardAnalyticsSummary`, it produces the expected Notion property payload.
- Endpoint rejects requests without `JOBS_SECRET`.

## Notes

- This is the "stats in Notion" feature the user explicitly chose. Keep it lean:
  read existing aggregates, do a handful of writes, nothing more. Do not move raw
  analytics into Notion.
