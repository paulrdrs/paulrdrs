import { z } from "zod"

export const siteEnvsSchema = z.object({
  SITE_URL: z.url()
})
