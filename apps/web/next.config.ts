import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"
import type { NextConfig } from "next"

// Populates `getCloudflareContext()` bindings (D1, R2, …) during `next dev` by
// spinning up local Miniflare from wrangler.jsonc. No-op for production builds.
initOpenNextCloudflareForDev()

// App Router hydration requires inline scripts. Turbopack also requires eval in
// development; media ingestion rejects SVG separately.
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
