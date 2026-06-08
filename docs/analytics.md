# Analytics

Analytics are internal and privacy-minimal.

## Recorded Events

Public page views are normalized before storage. Events can include:

- path
- content type: `page`, `post`, or `project`
- content ID when available
- timestamp
- referrer origin
- coarse device category
- daily salted visitor hash

The app does not store full IP addresses, full user agents, or full referrer
URLs in analytics events.

## Visitor Hashing

Visitor hashes are derived from the request IP, user agent, event date, and
`SESSION_SECRET`. Because the date is part of the hash input, visitor counts are
useful for short reporting windows without creating a durable cross-day visitor
identifier.

## Dashboard Reporting

The `/dashboard` overview shows read-only analytics summaries:

- recent views
- recent visitors
- daily views
- top posts
- top projects
- top paths

Empty analytics states should render without special setup.
