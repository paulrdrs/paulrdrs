# Repository Guidance
This file contains durable instructions for coding agents working in this
repository. Keep it concise and operational; detailed project knowledge belongs
in `docs/`.

## Read First
- Use `docs/index.md` to find the relevant documentation.
- Read `docs/architecture.md` before changing application structure, routes, or
  UI foundations.
- Read `docs/notion-schema.md` before changing Notion mapping, synchronization,
  content tables, or media behavior.
- Read `docs/deployment.md` before changing Cloudflare resources, bindings,
  migrations, Workflows, or deployment behavior.

## Repository Shape
- `src/app/`: Next.js App Router routes and route tests.
- `src/components/`: shared React components.
- `src/db/`: Drizzle schema and D1 queries.
- `src/notion/`: Notion mapping, block fetching, media rehosting, and sync.
- `src/media/`: media validation and R2 storage.
- `src/site/`: site-level navigation and hero configuration.
- `docs/`: maintained architecture and operating documentation.
- `drizzle/`: generated D1 migrations and metadata.

## Engineering Conventions
- Use strict TypeScript. Do not introduce `any`. Use `unknown` only when a
  value's shape is genuinely unknown, such as at an external boundary, then
  validate or narrow it before use. Prefer precise types everywhere else.
- Use descriptive names for all authored variables and callback parameters.
  Avoid single-character names and unclear abbreviations such as `i`, `x`, or
  `li` and similar; prefer names such as `index`, `item`, or a domain-specific noun.
- Use `.ts` and `.tsx`. Plain JavaScript is disallowed except for explicitly
  allowlisted tool configuration; `pnpm check:no-js` enforces this.
- Pin dependency versions exactly. Use `pnpm add` rather than hand-writing a
  version range; `pnpm check:deps` enforces this.
- Match surrounding naming, module boundaries, component patterns, and test
  style before introducing a new abstraction.
- Keep functions focused, prefer early returns, and explain only non-obvious
  intent in comments.
- Reuse existing content, metadata, media, and database helpers before adding
  parallel implementations.
- Keep tests colocated with the behavior they cover.
- Follow the presentation and spacing constraints in `docs/architecture.md` for
  UI changes.

## Database And Content Changes
- Generate schema migrations with `pnpm db:generate`; do not hand-edit generated
  migration SQL or snapshots.
- Never delete or rewrite an existing migration that may have reached production.
- Apply migrations locally with `pnpm db:migrate` when relevant.
- Preserve Notion property names and types exactly as documented in
  `docs/notion-schema.md`.
- Keep Notion off the visitor request path: synced content belongs in D1 and
  synced media belongs in R2.
- Update the relevant documentation when an architecture, content contract,
  environment variable, route, or deployment procedure changes.

## Working Safely
- Inspect the working tree before editing. Preserve unrelated user changes and
  avoid rewriting files outside the requested scope.
- Do not expose values from `.env`, `.dev.vars`, `.cf-deploy.env`, or Cloudflare
  secrets in logs or responses.
- Do not deploy, mutate remote D1, change Worker secrets, or modify production
  resources without explicit user authorization.
- Apply a required remote migration before deploying code that depends on it.
- Avoid destructive Git or filesystem operations unless the user clearly asks
  for them and the target has been verified.

## Verification
For code changes, run:

```sh
pnpm lint
pnpm typecheck
pnpm test
```

Also run the checks relevant to the change:
- Dependencies: `pnpm check:deps`
- File types: `pnpm check:no-js`
- Worker or deployment behavior: `pnpm build:worker`
- D1 schema changes: `pnpm db:migrate` plus targeted schema/query tests

Do not claim a check passed unless it was run successfully. If a check cannot
run because of sandboxing, unavailable credentials, or external infrastructure,
report that limitation explicitly.

## Definition Of Done
- The requested behavior is implemented without unrelated changes.
- Relevant tests cover the changed behavior.
- Required verification passes.
- The diff has been reviewed for regressions, accidental generated files, secret
  exposure, and stale documentation.
