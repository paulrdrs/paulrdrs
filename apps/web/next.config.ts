import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"
import type { NextConfig } from "next"

// Populates `getCloudflareContext()` bindings (D1, R2, …) during `next dev` by
// spinning up local Miniflare from wrangler.jsonc. No-op for production builds.
initOpenNextCloudflareForDev()

// Baseline CSP. Next's App Router streams hydration data via inline <script>
// tags, so `script-src` keeps `'unsafe-inline'`; tightening to nonce-based CSP
// would require middleware. The high-value SVG/XSS vector is already closed by
// rejecting SVG during upstream media ingestion. `'unsafe-eval'` is added only
// in development for Turbopack/HMR.
const isProduction = process.env.NODE_ENV === "production"

// Cloudflare Web Analytics loads its beacon from static.cloudflareinsights.com
// and POSTs page views to cloudflareinsights.com, so both are allowlisted.
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://cloudflareinsights.com",
  `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com${isProduction ? "" : " 'unsafe-eval'"}`
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload"
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  }
]

const nextConfig: NextConfig = {
  reactCompiler: true,
  headers: async () => [
    {
      source: "/:path*",
      headers: securityHeaders
    }
  ]
}

export default nextConfig
