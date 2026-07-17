import "server-only"
import {
  createDatabaseConnection,
  type DatabaseClient
} from "@paulrdrs/database/client"

type DatabaseGlobal = typeof globalThis & {
  paulrdrsDatabase?: DatabaseClient
}

const databaseGlobal = globalThis as DatabaseGlobal

export const getDb = () => {
  if (!databaseGlobal.paulrdrsDatabase) {
    const databaseUrl =
      process.env.NODE_ENV === "development"
        ? (process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL)
        : process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required")
    }

    databaseGlobal.paulrdrsDatabase = createDatabaseConnection(databaseUrl).db
  }

  return databaseGlobal.paulrdrsDatabase
}
