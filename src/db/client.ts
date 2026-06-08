import "server-only"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { serverEnvsSchema } from "@/envs/schemas"
import * as schema from "./schema"

type DbClient = ReturnType<typeof drizzle<typeof schema>>

let db: DbClient | undefined

export const resolveDatabaseUrl = ({
  databasePublicUrl,
  databaseUrl,
  nodeEnv
}: {
  databasePublicUrl?: string
  databaseUrl?: string
  nodeEnv?: string
}) => {
  const resolvedNodeEnv = nodeEnv || "development"

  return serverEnvsSchema.parse({
    DATABASE_URL:
      resolvedNodeEnv === "production"
        ? databaseUrl
        : databasePublicUrl || databaseUrl,
    NODE_ENV: resolvedNodeEnv
  }).DATABASE_URL
}

const getDatabaseUrl = () => {
  return resolveDatabaseUrl({
    databasePublicUrl: process.env.DATABASE_PUBLIC_URL,
    databaseUrl: process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV
  })
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
