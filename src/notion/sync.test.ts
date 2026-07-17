vi.mock("server-only", () => ({}))

import { getDb } from "@/db/client"
import { getNotionEnvs } from "@/envs/server"
import { fetchPageBlocks } from "./blocks"
import { getNotionClient } from "./client"
import {
  mapPagePage,
  mapPhotoPage,
  mapPostPage,
  mapProjectPage
} from "./mapping"
import { getNotionImageSourceKey, rehostImage } from "./media"
import {
  extractPrimaryPhoto,
  runNotionSync,
  syncPages,
  syncPhotos,
  syncPosts,
  syncProjects
} from "./sync"

vi.mock("@/db/client", () => ({ getDb: vi.fn() }))
vi.mock("@/envs/server", () => ({ getNotionEnvs: vi.fn() }))
vi.mock("./client", () => ({ getNotionClient: vi.fn() }))
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

const getDbMock = vi.mocked(getDb)
const getNotionEnvsMock = vi.mocked(getNotionEnvs)
const getNotionClientMock = vi.mocked(getNotionClient)
const fetchPageBlocksMock = vi.mocked(fetchPageBlocks)
const mapPostPageMock = vi.mocked(mapPostPage)
const mapProjectPageMock = vi.mocked(mapProjectPage)
const mapPagePageMock = vi.mocked(mapPagePage)
const mapPhotoPageMock = vi.mocked(mapPhotoPage)
const getNotionImageSourceKeyMock = vi.mocked(getNotionImageSourceKey)
const rehostImageMock = vi.mocked(rehostImage)

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

  getNotionClientMock.mockReturnValue({
    databases: { retrieve },
    dataSources: { query }
  } as unknown as ReturnType<typeof getNotionClient>)

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

  const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined)
  const values = vi.fn(() => ({ onConflictDoUpdate }))
  const insert = vi.fn(() => ({ values }))
  const deleteWhere = vi.fn().mockResolvedValue(undefined)
  const deleteFn = vi.fn(() => ({ where: deleteWhere }))

  getDbMock.mockReturnValue({
    delete: deleteFn,
    insert,
    select
  } as unknown as ReturnType<typeof getDb>)

  return { delete: deleteFn, insert, onConflictDoUpdate, select, values }
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

    const summary = await syncPosts("posts-db-id")

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

    await syncPosts("posts-db-id")

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

    await syncPosts("posts-db-id")

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

    await syncPosts("posts-db-id")

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

    const summary = await syncPosts("posts-db-id")

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

    await syncPosts("posts-db-id")

    expect(rehostImageMock).toHaveBeenCalledWith(
      "https://example.com/cover.png",
      "source-key"
    )
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ coverMediaId: "media-id-1" })
    )
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
    const { values } = setupDb([[], []])

    const summary = await syncProjects("projects-db-id")

    expect(summary).toEqual({ errors: [], synced: 1 })
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ category: "software" })
    )
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
    const { insert, values } = setupDb([])

    const summary = await syncPages("pages-db-id")

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
      [{ id: "photo-row-1" }], // row id after upsert
      [{ id: "project-row-1" }] // resolved linked project
    ])

    const summary = await syncPhotos("photos-db-id")

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
    expect(db.values).toHaveBeenCalledWith([
      { photoId: "photo-row-1", projectId: "project-row-1" }
    ])
  })

  it("fails a photo page without an image block and continues", async () => {
    mockNotionClient(["photo-1"])
    fetchPageBlocksMock.mockResolvedValue([paragraphBlock])
    mapPhotoPageMock.mockReturnValue(basePhoto)
    const db = setupDb([[], []])

    const summary = await syncPhotos("photos-db-id")

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
    const db = setupDb([[], [], [{ id: "photo-row-1" }]])

    const summary = await syncPhotos("photos-db-id")

    expect(summary).toEqual({ errors: [], synced: 1 })
    expect(db.delete).toHaveBeenCalledTimes(1)
    // Only the photo upsert insert — no link rows inserted.
    expect(db.insert).toHaveBeenCalledTimes(1)
  })
})

describe("runNotionSync", () => {
  it("syncs posts, projects, photos, and pages using their configured database ids", async () => {
    getNotionEnvsMock.mockReturnValue({
      JOBS_SECRET: "x".repeat(32),
      NOTION_PAGES_DB_ID: "pages-db",
      NOTION_PHOTOS_DB_ID: "photos-db",
      NOTION_POSTS_DB_ID: "posts-db",
      NOTION_PROJECTS_DB_ID: "projects-db",
      NOTION_TOKEN: "token"
    })
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
      [], // photos: collision
      [{ id: "photo-row-1" }] // photos: row id after upsert
    ])

    const summary = await runNotionSync()

    expect(retrieve).toHaveBeenCalledWith({ database_id: "posts-db" })
    expect(retrieve).toHaveBeenCalledWith({ database_id: "projects-db" })
    expect(retrieve).toHaveBeenCalledWith({ database_id: "photos-db" })
    expect(retrieve).toHaveBeenCalledWith({ database_id: "pages-db" })
    expect(summary).toEqual({
      pages: { errors: [], synced: 1 },
      photos: { errors: [], synced: 1 },
      posts: { errors: [], synced: 1 },
      projects: { errors: [], synced: 1 }
    })
  })
})
