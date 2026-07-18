const { unstableCacheMock } = vi.hoisted(() => ({
  unstableCacheMock: vi.fn(
    (
      callback: (...arguments_: unknown[]) => Promise<unknown>
    ): ((...arguments_: unknown[]) => Promise<unknown>) =>
      async (...arguments_: unknown[]) => {
        const result = await callback(...arguments_)

        return JSON.parse(JSON.stringify(result))
      }
  )
}))

vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({ unstable_cache: unstableCacheMock }))
vi.mock("./client", () => ({ getDb: vi.fn() }))

import { getDb } from "./client"
import { getPublishedPosts } from "./content"

const getDbMock = vi.mocked(getDb)

describe("public content caching", () => {
  it("registers published post reads with a five-minute lifetime", () => {
    expect(unstableCacheMock).toHaveBeenCalledWith(
      expect.any(Function),
      ["published-posts"],
      { revalidate: 300 }
    )
  })

  it("restores database dates after the cache serialization boundary", async () => {
    const createdAt = new Date("2026-07-01T10:00:00.000Z")
    const publishedAt = new Date("2026-07-02T10:00:00.000Z")
    const orderBy = vi.fn().mockResolvedValue([
      {
        createdAt,
        coverAltText: "Cached image",
        coverAttribution: null,
        coverMediaId: "cached-media",
        excerpt: "A cached post",
        id: "post-1",
        publishedAt,
        slug: "cached-post",
        title: "Cached post"
      }
    ])
    const where = vi.fn(() => ({ orderBy }))
    const leftJoin = vi.fn(() => ({ where }))
    const from = vi.fn(() => ({ leftJoin }))
    const select = vi.fn(() => ({ from }))

    getDbMock.mockReturnValue({ select } as unknown as ReturnType<typeof getDb>)

    const [post] = await getPublishedPosts()

    expect(post?.createdAt).toEqual(createdAt)
    expect(post?.createdAt).toBeInstanceOf(Date)
    expect(post?.publishedAt).toEqual(publishedAt)
    expect(post?.publishedAt).toBeInstanceOf(Date)
    expect(post?.coverMediaId).toBe("cached-media")
  })
})
