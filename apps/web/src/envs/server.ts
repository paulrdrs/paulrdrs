import "server-only"
import { siteEnvsSchema } from "./schemas"

export const getSiteEnvs = () =>
  siteEnvsSchema.parse({
    SITE_URL: process.env.SITE_URL
  })
