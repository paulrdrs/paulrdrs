import { NextRequest } from "next/server"
import { getNotionEnvs } from "@/envs/server"
import { POST } from "./route"

const syncMocks = vi.hoisted(() => ({
  runNotionSync: vi.fn(),
  syncPages: vi.fn(),
  syncPhotos: vi.fn(),
  syncPosts: vi.fn(),
  syncProjects: vi.fn()
}))
vi.mock("@paulrdrs/notion-sync/sync", () => ({
  createNotionSync: vi.fn(() => syncMocks)
}))
vi.mock("@paulrdrs/notion-sync/runtime", () => ({
  createNotionSyncRuntime: vi.fn(() => ({}))
}))
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(() => ({ env: { BUCKET: {}, DB: {} } }))
}))
vi.mock("@/envs/server", () => ({ getNotionEnvs: vi.fn() }))

const runNotionSyncMock = syncMocks.runNotionSync
const syncPhotosMock = syncMocks.syncPhotos
const syncPostsMock = syncMocks.syncPosts
const getNotionEnvsMock = vi.mocked(getNotionEnvs)

const secret = "a".repeat(32)

const createRequest = (
  headers: Record<string, string> = {},
  path = "https://paulrdrs.com/api/jobs/sync-content"
) =>
  new NextRequest(path, {
    headers,
    method: "POST"
  })

const emptySummary = {
  pages: { errors: [], synced: 0 },
  photos: { errors: [], synced: 0 },
  posts: { errors: [], synced: 0 },
  projects: { errors: [], synced: 0 }
}

describe("sync-content job route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getNotionEnvsMock.mockReturnValue({
      JOBS_SECRET: secret,
      NOTION_PAGES_DB_ID: "pages-db",
      NOTION_PHOTOS_DB_ID: "photos-db",
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
      photos: { errors: [], synced: 1 },
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

  it("syncs only the requested database when a type is provided", async () => {
    const postsSummary = { errors: [], synced: 3 }
    syncPostsMock.mockResolvedValue(postsSummary)

    const response = await POST(
      createRequest(
        { "x-jobs-secret": secret },
        "https://paulrdrs.com/api/jobs/sync-content?type=posts"
      )
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ posts: postsSummary })
    expect(syncPostsMock).toHaveBeenCalledWith("posts-db")
    expect(runNotionSyncMock).not.toHaveBeenCalled()
  })

  it("returns a failure response with the summary when an entry fails", async () => {
    const postsSummary = {
      errors: ["Malformed Notion post page post-2"],
      synced: 2
    }
    syncPostsMock.mockResolvedValue(postsSummary)

    const response = await POST(
      createRequest(
        { "x-jobs-secret": secret },
        "https://paulrdrs.com/api/jobs/sync-content?type=posts"
      )
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({ posts: postsSummary })
  })

  it("syncs only photos when type=photos is provided", async () => {
    const photosSummary = { errors: [], synced: 2 }
    syncPhotosMock.mockResolvedValue(photosSummary)

    const response = await POST(
      createRequest(
        { "x-jobs-secret": secret },
        "https://paulrdrs.com/api/jobs/sync-content?type=photos"
      )
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ photos: photosSummary })
    expect(syncPhotosMock).toHaveBeenCalledWith("photos-db")
    expect(runNotionSyncMock).not.toHaveBeenCalled()
  })

  it("rejects an unsupported sync type without running a sync", async () => {
    const response = await POST(
      createRequest(
        { "x-jobs-secret": secret },
        "https://paulrdrs.com/api/jobs/sync-content?type=post"
      )
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: "Invalid sync type"
    })
    expect(runNotionSyncMock).not.toHaveBeenCalled()
    expect(syncPostsMock).not.toHaveBeenCalled()
  })

  it("rejects repeated sync types without running a sync", async () => {
    const response = await POST(
      createRequest(
        { "x-jobs-secret": secret },
        "https://paulrdrs.com/api/jobs/sync-content?type=posts&type=photos"
      )
    )

    expect(response.status).toBe(400)
    expect(runNotionSyncMock).not.toHaveBeenCalled()
    expect(syncPostsMock).not.toHaveBeenCalled()
    expect(syncPhotosMock).not.toHaveBeenCalled()
  })
})
