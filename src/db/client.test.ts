vi.mock("server-only", () => ({}))

import { resolveDatabaseUrl } from "./client"

describe("database URL resolution", () => {
  it("uses DATABASE_PUBLIC_URL outside production when present", () => {
    expect(
      resolveDatabaseUrl({
        databasePublicUrl: "postgres://public:password@localhost:5432/public",
        databaseUrl:
          "postgres://private:password@postgres.railway.internal:5432/private",
        nodeEnv: "development"
      })
    ).toBe("postgres://public:password@localhost:5432/public")
  })

  it("keeps production on DATABASE_URL", () => {
    expect(
      resolveDatabaseUrl({
        databasePublicUrl: "postgres://public:password@localhost:5432/public",
        databaseUrl:
          "postgres://private:password@postgres.railway.internal:5432/private",
        nodeEnv: "production"
      })
    ).toBe("postgres://private:password@postgres.railway.internal:5432/private")
  })

  it("falls back to DATABASE_URL outside production", () => {
    expect(
      resolveDatabaseUrl({
        databaseUrl: "postgres://local:password@localhost:5432/local",
        nodeEnv: "development"
      })
    ).toBe("postgres://local:password@localhost:5432/local")
  })
})
