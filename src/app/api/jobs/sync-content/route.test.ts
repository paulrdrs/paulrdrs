import { NextRequest } from "next/server"
import { getNotionEnvs } from "@/envs/server"
import { runNotionSync } from "@/notion/sync"
import { POST } from "./route"

vi.mock("@/notion/sync", () => ({ runNotionSync: vi.fn() }))
vi.mock("@/envs/server", () => ({ getNotionEnvs: vi.fn() }))

const runNotionSyncMock = vi.mocked(runNotionSync)
const getNotionEnvsMock = vi.mocked(getNotionEnvs)

const secret = "a".repeat(32)

const createRequest = (headers: Record<string, string> = {}) =>
  new NextRequest("https://paulrdrs.com/api/jobs/sync-content", {
    headers,
    method: "POST"
  })

const emptySummary = {
  pages: { errors: [], synced: 0 },
  posts: { errors: [], synced: 0 },
  projects: { errors: [], synced: 0 }
}

describe("sync-content job route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getNotionEnvsMock.mockReturnValue({
      JOBS_SECRET: secret,
      NOTION_PAGES_DB_ID: "pages-db",
      NOTION_POSTS_DB_ID: "posts-db",
      NOTION_PROJECTS_DB_ID: "projects-db",
      NOTION_TOKEN: "token"
    })
  })

  it("rejects requests without the jobs secret", async () => {
    const response = await POST(createRequest())

    expect(response.status).toBe(401)
    expect(runNotionSyncMock).not.toHaveBeenCalled()
  })

  it("rejects requests with the wrong secret", async () => {
    const response = await POST(
      createRequest({ "x-jobs-secret": "wrong-secret" })
    )

    expect(response.status).toBe(401)
    expect(runNotionSyncMock).not.toHaveBeenCalled()
  })

  it("runs the sync and returns the summary when authorized via x-jobs-secret", async () => {
    const summary = {
      pages: { errors: [], synced: 1 },
      posts: { errors: [], synced: 2 },
      projects: { errors: [], synced: 0 }
    }
    runNotionSyncMock.mockResolvedValue(summary)

    const response = await POST(createRequest({ "x-jobs-secret": secret }))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(summary)
  })

  it("accepts the secret via a Bearer Authorization header", async () => {
    runNotionSyncMock.mockResolvedValue(emptySummary)

    const response = await POST(
      createRequest({ authorization: `Bearer ${secret}` })
    )

    expect(response.status).toBe(200)
    expect(runNotionSyncMock).toHaveBeenCalledTimes(1)
  })
})
