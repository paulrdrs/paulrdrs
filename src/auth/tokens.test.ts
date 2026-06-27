vi.mock("server-only", () => ({}))

import { getDb } from "@/db/client"
import { deleteExpiredSessions, getSessionByToken } from "./tokens"

vi.mock("@/db/client", () => ({
  getDb: vi.fn()
}))

const getDbMock = vi.mocked(getDb)

type Session = {
  id: string
  email: string
  expiresAt: Date
  lastSeenAt: Date
}

const buildDbMock = (session: Session | undefined) => {
  const updateWhere = vi.fn().mockResolvedValue(undefined)
  const updateSet = vi.fn(() => ({ where: updateWhere }))
  const update = vi.fn(() => ({ set: updateSet }))

  const limit = vi.fn().mockResolvedValue(session ? [session] : [])
  const where = vi.fn(() => ({ limit }))
  const from = vi.fn(() => ({ where }))
  const select = vi.fn(() => ({ from }))

  const deleteWhere = vi.fn().mockResolvedValue(undefined)
  const deleteFn = vi.fn(() => ({ where: deleteWhere }))

  getDbMock.mockReturnValue({
    select,
    update,
    delete: deleteFn
  } as unknown as ReturnType<typeof getDb>)

  return { update, deleteFn, deleteWhere }
}

describe("getSessionByToken", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("refreshes last_seen_at only after the throttle window", async () => {
    const now = new Date("2026-06-27T12:00:00.000Z")
    const { update } = buildDbMock({
      id: "session-id",
      email: "admin@example.com",
      expiresAt: new Date("2026-12-01T00:00:00.000Z"),
      lastSeenAt: new Date("2026-06-27T09:00:00.000Z") // 3h ago
    })

    await getSessionByToken("token", now)

    expect(update).toHaveBeenCalledTimes(1)
  })

  it("skips the last_seen_at write inside the throttle window", async () => {
    const now = new Date("2026-06-27T12:00:00.000Z")
    const { update } = buildDbMock({
      id: "session-id",
      email: "admin@example.com",
      expiresAt: new Date("2026-12-01T00:00:00.000Z"),
      lastSeenAt: new Date("2026-06-27T11:45:00.000Z") // 15m ago
    })

    await getSessionByToken("token", now)

    expect(update).not.toHaveBeenCalled()
  })

  it("returns undefined when no active session matches", async () => {
    const { update } = buildDbMock(undefined)

    await expect(getSessionByToken("token")).resolves.toBeUndefined()
    expect(update).not.toHaveBeenCalled()
  })
})

describe("deleteExpiredSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("issues a delete for expired sessions", async () => {
    const { deleteFn, deleteWhere } = buildDbMock(undefined)

    await deleteExpiredSessions()

    expect(deleteFn).toHaveBeenCalledTimes(1)
    expect(deleteWhere).toHaveBeenCalledTimes(1)
  })
})
