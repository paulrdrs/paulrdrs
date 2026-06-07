import "server-only"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { serverEnvsSchema } from "@/envs/schemas"
import * as schema from "./schema"

type DbClient = ReturnType<typeof drizzle<typeof schema>>

let db: DbClient | undefined

const getDatabaseUrl = () => {
  return serverEnvsSchema.parse({
    API_URL: process.env.API_URL || "http://localhost:4000",
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV || "development"
  }).DATABASE_URL
}

export const getDb = () => {
  if (!db) {
    const queryClient = postgres(getDatabaseUrl(), {
      prepare: false
    })

    db = drizzle(queryClient, { schema })
  }

  return db
}
