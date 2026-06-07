import "server-only"
import { serverEnvsSchema } from "./schemas"

export const serverEnvs = serverEnvsSchema.parse({
  API_URL: process.env.API_URL || "http://localhost:4000",
  AUTH_SECRET_KEY: process.env.AUTH_SECRET_KEY,
  NODE_ENV: process.env.NEXTJS_ENV || "development"
})
