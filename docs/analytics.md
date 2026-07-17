# Analytics

Analytics are handled entirely by **Cloudflare Web Analytics** — the app no
longer records or stores any analytics data of its own.

## How It Works

The root layout renders the Cloudflare beacon
(`https://static.cloudflareinsights.com/beacon.min.js`) when the `CF_BEACON_TOKEN`
runtime var is set. The beacon is cookieless and privacy-first, and reports
per-path page views to the Cloudflare dashboard. The Content-Security-Policy in
`next.config.ts` allowlists the beacon script and its POST endpoint.

Because each post and project has its own URL, per-path reporting is effectively
per-content. There is no in-app reporting UI and no analytics tables.

## Setup

Enable Web Analytics for the domain in the Cloudflare dashboard, then set
`CF_BEACON_TOKEN` on the Worker (see [Deployment](./deployment.md)). When the
token is absent (e.g. local dev), the beacon is simply not rendered.
