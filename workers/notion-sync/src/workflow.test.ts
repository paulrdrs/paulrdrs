import type { NotionSyncEnvironment } from "./runtime"
import type { NotionSyncTypeSummary } from "./sync"

const runtime = {
  databaseIds: {
    pages: "pages-db",
    photos: "photos-db",
    posts: "posts-db",
    projects: "projects-db"
  }
}

const syncMethods = {
  syncPages: vi.fn(),
  syncPhotos: vi.fn(),
  syncPosts: vi.fn(),
  syncProjects: vi.fn()
}

vi.mock("cloudflare:workers", () => ({
  WorkflowEntrypoint: class {
    protected env: CloudflareEnv

    constructor(_context: ExecutionContext, environment: CloudflareEnv) {
      this.env = environment
    }
  }
}))

vi.mock("./runtime", () => ({
  createNotionSyncRuntime: vi.fn(() => runtime)
}))

vi.mock("./sync", () => ({
  createNotionSync: vi.fn(() => syncMethods)
}))

import { NotionSyncWorkflow } from "./workflow"

const successfulSummary: NotionSyncTypeSummary = { errors: [], synced: 2 }

const createStep = () => {
  const calls: string[] = []
  const step = {
    do: vi.fn(async (name: string, callback: () => Promise<unknown>) => {
      calls.push(name)
      return callback()
    }),
    sleep: vi.fn(async (name: string) => {
      calls.push(name)
    })
  }
  return { calls, step }
}

const createWorkflow = () =>
  new NotionSyncWorkflow(
    {} as ExecutionContext,
    {} as CloudflareEnv & NotionSyncEnvironment
  ) as NotionSyncWorkflow

describe("NotionSyncWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const syncMethod of Object.values(syncMethods)) {
      syncMethod.mockResolvedValue(successfulSummary)
    }
  })

  it("runs ordered durable stages and pauses only between them", async () => {
    const { calls, step } = createStep()

    await expect(
      createWorkflow().run({ payload: {} } as never, step as never)
    ).resolves.toEqual({
      pages: successfulSummary,
      photos: successfulSummary,
      posts: successfulSummary,
      projects: successfulSummary
    })

    expect(calls).toEqual([
      "sync-posts",
      "pause-after-posts",
      "sync-projects",
      "pause-after-projects",
      "sync-photos",
      "pause-after-photos",
      "sync-pages"
    ])
    expect(syncMethods.syncPosts).toHaveBeenCalledWith()
    expect(syncMethods.syncProjects).toHaveBeenCalledWith()
    expect(syncMethods.syncPhotos).toHaveBeenCalledWith()
    expect(syncMethods.syncPages).toHaveBeenCalledWith()
  })

  it("logs and throws entry errors from their Workflow step", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {})
    syncMethods.syncProjects.mockResolvedValue({
      errors: ["Malformed project"],
      synced: 1
    })
    const { step } = createStep()

    await expect(
      createWorkflow().run({ payload: {} } as never, step as never)
    ).rejects.toThrow("Notion projects sync failed: Malformed project")

    expect(errorLog).toHaveBeenCalledWith("Notion sync stage failed", {
      errors: ["Malformed project"],
      stage: "projects",
      synced: 1
    })
    expect(syncMethods.syncPhotos).not.toHaveBeenCalled()
  })

  it("logs and propagates a thrown stage failure", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {})
    syncMethods.syncPosts.mockRejectedValue(new Error("Notion query failed"))
    const { step } = createStep()

    await expect(
      createWorkflow().run({ payload: {} } as never, step as never)
    ).rejects.toThrow("Notion query failed")

    expect(errorLog).toHaveBeenCalledWith("Notion sync stage failed", {
      errors: ["Notion query failed"],
      stage: "posts",
      synced: 0
    })
    expect(syncMethods.syncProjects).not.toHaveBeenCalled()
  })
})
