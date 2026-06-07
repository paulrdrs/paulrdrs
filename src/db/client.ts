import "server-only"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { serverEnvs } from "@/envs/server"
import * as schema from "./schema"

const queryClient = postgres(serverEnvs.DATABASE_URL, {
  prepare: false
})

export const db = drizzle(queryClient, { schema })
