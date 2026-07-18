import { pages, photos, posts, projects } from "@paulrdrs/database/schema"
import { fetchPageBlocks } from "./blocks"
import {
  mapPagePage,
  mapPhotoPage,
  mapPostPage,
  mapProjectPage
} from "./mapping"
import { getNotionImageSourceKey, rehostImage } from "./media"
import type { NotionSyncRuntime } from "./runtime"
import { createNotionSync, extractPrimaryPhoto } from "./sync"

vi.mock("./blocks", () => ({ fetchPageBlocks: vi.fn() }))
vi.mock("./mapping", () => ({
  mapPagePage: vi.fn(),
  mapPhotoPage: vi.fn(),
  mapPostPage: vi.fn(),
  mapProjectPage: vi.fn()
}))
vi.mock("./media", () => ({
  getNotionImageSourceKey: vi.fn(),
  rehostImage: vi.fn()
}))

const fetchPageBlocksMock = vi.mocked(fetchPageBlocks)
const mapPostPageMock = vi.mocked(mapPostPage)
const mapProjectPageMock = vi.mocked(mapProjectPage)
const mapPagePageMock = vi.mocked(mapPagePage)
const mapPhotoPageMock = vi.mocked(mapPhotoPage)
const getNotionImageSourceKeyMock = vi.mocked(getNotionImageSourceKey)
const rehostImageMock = vi.mocked(rehostImage)

const runtime = {
  bucket: {},
  databaseIds: {
    pages: "pages-db",
    photos: "photos-db",
    posts: "posts-db",
    projects: "projects-db"
  }
} as unknown as NotionSyncRuntime

const sync = createNotionSync(runtime)

const basePost = {
  coverImage: null,
  excerpt: null,
  notionPageId: "post-1",
  publishedAt: null,
  seoDescription: null,
  seoTitle: null,
  slug: "post-slug",
  status: "draft" as const,
  tags: [],
  title: "Title"
}

const baseProject = {
  category: "software" as const,
  coverImage: null,
  excerpt: null,
  notionPageId: "project-1",
  publishedAt: null,
  seoDescription: null,
  seoTitle: null,
  slug: "project-slug",
  status: "draft" as const,
  title: "Title"
}

const basePhoto = {
  excerpt: null,
  notionPageId: "photo-1",
  projectNotionPageIds: ["notion-project-1"],
  publishedAt: null,
  slug: "photo-slug",
  status: "published" as const,
  title: "Pier at Dusk"
}

const imageBlock = {
  caption: [],
  children: [],
  id: "img-1",
  mediaId: "media-1",
  type: "image" as const
}

const paragraphBlock = {
  children: [],
  id: "p1",
  richText: [],
  type: "paragraph" as const
}

const buildNotionPage = (id: string) => ({
  id,
  object: "page" as const,
  properties: {},
  url: `https://notion.so/${id}`
})

const mockNotionClient = (pageIds: string[]) => {
  const retrieve = vi
    .fn()
    .mockResolvedValue({ data_sources: [{ id: "data-source-1", name: "DB" }] })
  const query = vi.fn().mockResolvedValue({
    has_more: false,
    next_cursor: null,
    object: "list",
    results: pageIds.map(buildNotionPage)
  })

  Object.assign(runtime, {
    notion: {
      databases: { retrieve },
      dataSources: { query }
    }
  })

  return { query, retrieve }
}

const buildSelectChain = (result: unknown[]) => ({
  from: vi.fn(() => ({
    where: vi.fn(() => ({
      limit: vi.fn().mockResolvedValue(result)
    }))
  }))
})

const setupDb = (selectResults: unknown[][]) => {
  const select = vi.fn()

  for (const result of selectResults) {
    select.mockReturnValueOnce(buildSelectChain(result))
  }

  const returning = vi.fn().mockResolvedValue([{ id: "photo-row-1" }])
  const onConflictDoUpdate = vi.fn(() => ({ returning }))
  const values = vi.fn(() => ({ onConflictDoUpdate }))
  const insert = vi.fn(() => ({ values }))
  const deleteWhere = vi.fn().mockResolvedValue(undefined)
  const deleteFn = vi.fn(() => ({ where: deleteWhere }))
  const batch = vi.fn().mockResolvedValue([])
  const updateWhere = vi.fn().mockResolvedValue(undefined)
  const set = vi.fn(() => ({ where: updateWhere }))
  const update = vi.fn(() => ({ set }))

  Object.assign(runtime, {
    db: {
      batch,
      delete: deleteFn,
      insert,
      select,
      update
    }
  })

  return {
    batch,
    delete: deleteFn,
    insert,
    onConflictDoUpdate,
    returning,
    select,
    set,
    update,
    updateWhere,
    values
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("syncPosts", () => {
  it("upserts a new post with the mapped values and the block tree", async () => {
    mockNotionClient(["post-1"])
    fetchPageBlocksMock.mockResolvedValue([
      { children: [], id: "b1", richText: [], type: "paragraph" }
    ])
    mapPostPageMock.mockReturnValue({
      ...basePost,
      slug: "hello-world",
      status: "published"
    })
    const { values } = setupDb([[], []])

    const summary = await sync.syncPosts("posts-db-id")

    expect(summary).toEqual({ errors: [], synced: 1 })
    expect(values).toHaveBeenCalledWith({
      body: [{ children: [], id: "b1", richText: [], type: "paragraph" }],
      coverMediaId: null,
      excerpt: null,
      notionPageId: "post-1",
      publishedAt: null,
      seoDescription: null,
      seoTitle: null,
      slug: "hello-world",
      slugHistory: [],
      status: "published",
      tags: [],
      title: "Title"
    })
  })

  it("keeps the stored slug and does not grow history when the mapped slug is unchanged", async () => {
    mockNotionClient(["post-1"])
    fetchPageBlocksMock.mockResolvedValue([])
    mapPostPageMock.mockReturnValue({
      ...basePost,
      slug: "hello-world",
      status: "published"
    })
    const { values } = setupDb([
      [{ slug: "hello-world", slugHistory: [], status: "published" }],
      []
    ])

    await sync.syncPosts("posts-db-id")

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "hello-world", slugHistory: [] })
    )
  })

  it("freezes a rename on a published row by moving the old slug into history", async () => {
    mockNotionClient(["post-1"])
    fetchPageBlocksMock.mockResolvedValue([])
    mapPostPageMock.mockReturnValue({
      ...basePost,
      slug: "new-slug",
      status: "published"
    })
    const { values } = setupDb([
      [{ slug: "old-slug", slugHistory: [], status: "published" }],
      []
    ])

    await sync.syncPosts("posts-db-id")

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "new-slug", slugHistory: ["old-slug"] })
    )
  })

  it("does not grow history for an unpublished row that takes the mapped slug directly", async () => {
    mockNotionClient(["post-1"])
    fetchPageBlocksMock.mockResolvedValue([])
    mapPostPageMock.mockReturnValue({
      ...basePost,
      slug: "draft-slug",
      status: "draft"
    })
    const { values } = setupDb([
      [{ slug: "old-draft-slug", slugHistory: [], status: "draft" }],
      []
    ])

    await sync.syncPosts("posts-db-id")

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "draft-slug", slugHistory: [] })
    )
  })

  it("fails a page on a slug collision with a different notionPageId and continues with remaining pages", async () => {
    mockNotionClient(["post-1", "post-2"])
    fetchPageBlocksMock.mockResolvedValue([])
    mapPostPageMock
      .mockReturnValueOnce({
        ...basePost,
        notionPageId: "post-1",
        slug: "taken-slug"
      })
      .mockReturnValueOnce({
        ...basePost,
        notionPageId: "post-2",
        slug: "free-slug"
      })
    const { values } = setupDb([
      [], // post-1: no existing row by notionPageId
      [{ id: "other-post-id" }], // post-1: a different post already owns this slug
      [], // post-2: no existing row by notionPageId
      [] // post-2: no collision
    ])

    const summary = await sync.syncPosts("posts-db-id")

    expect(summary.synced).toBe(1)
    expect(summary.errors).toEqual([
      'Slug "taken-slug" is already used by another post'
    ])
    expect(values).toHaveBeenCalledTimes(1)
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "free-slug" })
    )
  })

  it("re-hosts the cover image and stores the returned media id", async () => {
    mockNotionClient(["post-1"])
    fetchPageBlocksMock.mockResolvedValue([])
    mapPostPageMock.mockReturnValue({
      ...basePost,
      coverImage: { type: "external", url: "https://example.com/cover.png" }
    })
    getNotionImageSourceKeyMock.mockReturnValue("source-key")
    rehostImageMock.mockResolvedValue("media-id-1")
    const { values } = setupDb([[], []])

    await sync.syncPosts("posts-db-id")

    expect(rehostImageMock).toHaveBeenCalledWith(
      runtime,
      "https://example.com/cover.png",
      "source-key"
    )
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ coverMediaId: "media-id-1" })
    )
  })

  it("marks published posts missing from a complete Notion query as draft", async () => {
    mockNotionClient([])
    const db = setupDb([])

    const summary = await sync.syncPosts("posts-db-id")

    expect(summary).toEqual({ errors: [], synced: 0 })
    expect(db.update).toHaveBeenCalledWith(posts)
    expect(db.set).toHaveBeenCalledWith({
      status: "draft",
      updatedAt: expect.any(Date)
    })
    expect(db.updateWhere).toHaveBeenCalledTimes(1)
  })

  it("does not reconcile posts when the Notion database query fails", async () => {
    const { query } = mockNotionClient([])
    query.mockRejectedValue(new Error("Notion unavailable"))
    const db = setupDb([])

    await expect(sync.syncPosts("posts-db-id")).rejects.toThrow(
      "Notion unavailable"
    )
    expect(db.update).not.toHaveBeenCalled()
  })

  it("reports a mapping failure, continues, and reconciles from all source ids", async () => {
    mockNotionClient(["post-1", "post-2"])
    fetchPageBlocksMock.mockResolvedValue([])
    mapPostPageMock
      .mockImplementationOnce(() => {
        throw new Error("Malformed Notion post page post-1")
      })
      .mockReturnValueOnce({ ...basePost, notionPageId: "post-2" })
    const db = setupDb([[], []])

    const summary = await sync.syncPosts("posts-db-id")

    expect(summary).toEqual({
      errors: ["Malformed Notion post page post-1"],
      synced: 1
    })
    expect(db.update).toHaveBeenCalledWith(posts)
  })
})

describe("syncProjects", () => {
  it("scopes the slug collision check to the project category", async () => {
    mockNotionClient(["project-1"])
    fetchPageBlocksMock.mockResolvedValue([])
    mapProjectPageMock.mockReturnValue({
      ...baseProject,
      notionPageId: "project-1",
      slug: "my-project"
    })
    const { update, values } = setupDb([[], []])

    const summary = await sync.syncProjects("projects-db-id")

    expect(summary).toEqual({ errors: [], synced: 1 })
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ category: "software" })
    )
    expect(update).toHaveBeenCalledWith(projects)
  })
})

describe("syncPages", () => {
  it("upserts a page keyed by its Notion Key property", async () => {
    mockNotionClient(["page-1"])
    fetchPageBlocksMock.mockResolvedValue([])
    mapPagePageMock.mockReturnValue({
      key: "home",
      notionPageId: "page-1",
      publishedAt: null,
      status: "draft",
      title: "Home"
    })
    const { insert, update, values } = setupDb([])

    const summary = await sync.syncPages("pages-db-id")

    expect(summary).toEqual({ errors: [], synced: 1 })
    expect(insert).toHaveBeenCalledTimes(1)
    expect(values).toHaveBeenCalledWith({
      body: [],
      key: "home",
      notionPageId: "page-1",
      publishedAt: null,
      status: "draft",
      title: "Home"
    })
    expect(update).toHaveBeenCalledWith(pages)
  })

  it("prepares at most three pages concurrently and persists them all", async () => {
    mockNotionClient(["page-1", "page-2", "page-3", "page-4"])
    mapPagePageMock.mockImplementation((page) => ({
      key: "home",
      notionPageId: page.id,
      publishedAt: null,
      status: "draft",
      title: page.id
    }))
    const db = setupDb([])
    let activePreparations = 0
    let maximumActivePreparations = 0
    let preparationCalls = 0
    let releaseFirstBatch: () => void = () => {}
    const firstBatchGate = new Promise<void>((resolve) => {
      releaseFirstBatch = resolve
    })

    fetchPageBlocksMock.mockImplementation(async () => {
      preparationCalls += 1
      const callNumber = preparationCalls
      activePreparations += 1
      maximumActivePreparations = Math.max(
        maximumActivePreparations,
        activePreparations
      )

      if (callNumber <= 3) {
        await firstBatchGate
      }

      activePreparations -= 1
      return []
    })

    const syncOperation = sync.syncPages("pages-db-id")

    await vi.waitFor(() => expect(fetchPageBlocksMock).toHaveBeenCalledTimes(3))
    expect(db.insert).not.toHaveBeenCalled()
    releaseFirstBatch()

    await expect(syncOperation).resolves.toEqual({ errors: [], synced: 4 })
    expect(fetchPageBlocksMock).toHaveBeenCalledTimes(4)
    expect(maximumActivePreparations).toBe(3)
    expect(db.insert).toHaveBeenCalledTimes(4)
  })
})

describe("extractPrimaryPhoto", () => {
  it("extracts a top-level first image and removes it from the body", () => {
    expect(extractPrimaryPhoto([imageBlock, paragraphBlock])).toEqual({
      body: [paragraphBlock],
      mediaId: "media-1"
    })
  })

  it("finds the first image nested inside another block", () => {
    const toggle = {
      children: [imageBlock],
      id: "t1",
      richText: [],
      type: "toggle" as const
    }

    expect(extractPrimaryPhoto([paragraphBlock, toggle])).toEqual({
      body: [paragraphBlock, { ...toggle, children: [] }],
      mediaId: "media-1"
    })
  })

  it("throws when the body has no image block", () => {
    expect(() => extractPrimaryPhoto([paragraphBlock])).toThrow(
      "Photo page has no image block"
    )
  })
})

describe("syncPhotos", () => {
  it("upserts a photo with the primary image extracted and rebuilds project links", async () => {
    mockNotionClient(["photo-1"])
    fetchPageBlocksMock.mockResolvedValue([imageBlock, paragraphBlock])
    mapPhotoPageMock.mockReturnValue(basePhoto)
    const db = setupDb([
      [], // no existing row by notionPageId
      [], // no slug collision
      [{ id: "project-row-1" }] // resolved linked project
    ])

    const summary = await sync.syncPhotos("photos-db-id")

    expect(summary).toEqual({ errors: [], synced: 1 })
    expect(db.values).toHaveBeenCalledWith(
      expect.objectContaining({
        body: [paragraphBlock],
        mediaId: "media-1",
        slug: "photo-slug",
        title: "Pier at Dusk"
      })
    )
    expect(db.delete).toHaveBeenCalledTimes(1)
    expect(db.batch).toHaveBeenCalledTimes(1)
    expect(db.returning).toHaveBeenCalledWith({ id: photos.id })
    expect(db.values).toHaveBeenCalledWith([
      { photoId: "photo-row-1", projectId: "project-row-1" }
    ])
    expect(db.update).toHaveBeenCalledWith(photos)
  })

  it("fails a photo page without an image block and continues", async () => {
    mockNotionClient(["photo-1"])
    fetchPageBlocksMock.mockResolvedValue([paragraphBlock])
    mapPhotoPageMock.mockReturnValue(basePhoto)
    const db = setupDb([[], []])

    const summary = await sync.syncPhotos("photos-db-id")

    expect(summary.synced).toBe(0)
    expect(summary.errors).toEqual(["Photo page has no image block"])
    expect(db.values).not.toHaveBeenCalled()
  })

  it("clears links when the Projects relation is empty", async () => {
    mockNotionClient(["photo-1"])
    fetchPageBlocksMock.mockResolvedValue([imageBlock])
    mapPhotoPageMock.mockReturnValue({
      ...basePhoto,
      projectNotionPageIds: []
    })
    const db = setupDb([[], []])

    const summary = await sync.syncPhotos("photos-db-id")

    expect(summary).toEqual({ errors: [], synced: 1 })
    expect(db.delete).toHaveBeenCalledTimes(1)
    expect(db.batch).not.toHaveBeenCalled()
    // Only the photo upsert insert — no link rows inserted.
    expect(db.insert).toHaveBeenCalledTimes(1)
  })

  it("reports an atomic project-link replacement failure", async () => {
    mockNotionClient(["photo-1"])
    fetchPageBlocksMock.mockResolvedValue([imageBlock])
    mapPhotoPageMock.mockReturnValue(basePhoto)
    const db = setupDb([[], [], [{ id: "project-row-1" }]])
    db.batch.mockRejectedValueOnce(new Error("Project link insert failed"))

    const summary = await sync.syncPhotos("photos-db-id")

    expect(summary).toEqual({
      errors: ["Project link insert failed"],
      synced: 0
    })
    expect(db.batch).toHaveBeenCalledTimes(1)
  })
})

describe("runNotionSync", () => {
  it("syncs posts, projects, photos, and pages using their configured database ids", async () => {
    const { retrieve } = mockNotionClient(["entry-1"])
    fetchPageBlocksMock.mockResolvedValue([imageBlock])
    mapPostPageMock.mockReturnValue({ ...basePost, notionPageId: "entry-1" })
    mapProjectPageMock.mockReturnValue({
      ...baseProject,
      notionPageId: "entry-1"
    })
    mapPhotoPageMock.mockReturnValue({
      ...basePhoto,
      notionPageId: "entry-1",
      projectNotionPageIds: []
    })
    mapPagePageMock.mockReturnValue({
      key: "home",
      notionPageId: "entry-1",
      publishedAt: null,
      status: "draft",
      title: "Home"
    })
    setupDb([
      [], // posts: existing
      [], // posts: collision
      [], // projects: existing
      [], // projects: collision
      [], // photos: existing
      [] // photos: collision
    ])

    const summary = await sync.runNotionSync()

    expect(retrieve).toHaveBeenCalledWith({ database_id: "posts-db" })
    expect(retrieve).toHaveBeenCalledWith({ database_id: "projects-db" })
    expect(retrieve).toHaveBeenCalledWith({ database_id: "photos-db" })
    expect(retrieve).toHaveBeenCalledWith({ database_id: "pages-db" })
    expect(retrieve.mock.calls.map(([request]) => request.database_id)).toEqual(
      ["posts-db", "projects-db", "photos-db", "pages-db"]
    )
    expect(summary).toEqual({
      pages: { errors: [], synced: 1 },
      photos: { errors: [], synced: 1 },
      posts: { errors: [], synced: 1 },
      projects: { errors: [], synced: 1 }
    })
  })

  it("preserves a partial stage summary in the full-sync result", async () => {
    mockNotionClient(["entry-1"])
    fetchPageBlocksMock.mockResolvedValue([imageBlock])
    mapPostPageMock.mockImplementation(() => {
      throw new Error("Malformed Notion post page entry-1")
    })
    mapProjectPageMock.mockReturnValue({
      ...baseProject,
      notionPageId: "entry-1"
    })
    mapPhotoPageMock.mockReturnValue({
      ...basePhoto,
      notionPageId: "entry-1",
      projectNotionPageIds: []
    })
    mapPagePageMock.mockReturnValue({
      key: "home",
      notionPageId: "entry-1",
      publishedAt: null,
      status: "draft",
      title: "Home"
    })
    setupDb([
      [], // projects: existing
      [], // projects: collision
      [], // photos: existing
      [] // photos: collision
    ])

    await expect(sync.runNotionSync()).resolves.toEqual({
      pages: { errors: [], synced: 1 },
      photos: { errors: [], synced: 1 },
      posts: {
        errors: ["Malformed Notion post page entry-1"],
        synced: 0
      },
      projects: { errors: [], synced: 1 }
    })
  })
})
