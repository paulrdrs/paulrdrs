import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

export type DatabaseClient = PostgresJsDatabase<typeof schema>

export type DatabaseConnection = {
  readonly close: () => Promise<void>
  readonly db: DatabaseClient
}

export const createDatabaseConnection = (
  databaseUrl: string
): DatabaseConnection => {
  const sql = postgres(databaseUrl)

  return {
    close: () => sql.end({ timeout: 5 }),
    db: drizzle(sql, { schema })
  }
}
