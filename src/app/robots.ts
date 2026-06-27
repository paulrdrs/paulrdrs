import type { MetadataRoute } from "next"
import { getSiteEnvs } from "@/envs/server"

export default function robots(): MetadataRoute.Robots {
  const base = getSiteEnvs().SITE_URL.replace(/\/$/, "")

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard"]
    },
    host: base,
    sitemap: `${base}/sitemap.xml`
  }
}
