import { getPublishedPosts, getPublishedProjects } from "@/db/content"
import sitemap from "./sitemap"

vi.mock("@/db/content", () => ({
  getPublishedPosts: vi.fn(),
  getPublishedProjects: vi.fn()
}))

vi.mock("@/envs/server", () => ({
  getSiteEnvs: vi.fn(() => ({ SITE_URL: "https://paulrdrs.com" }))
}))

const getPublishedPostsMock = vi.mocked(getPublishedPosts)
const getPublishedProjectsMock = vi.mocked(getPublishedProjects)

describe("sitemap", () => {
  it("includes static routes plus published posts and projects", async () => {
    getPublishedPostsMock.mockResolvedValue([
      {
        id: "post-1",
        title: "Hello",
        slug: "hello",
        excerpt: null,
        publishedAt: new Date("2026-01-01"),
        createdAt: new Date("2025-12-01")
      }
    ])
    getPublishedProjectsMock.mockResolvedValue([
      {
        id: "project-1",
        title: "Camera",
        slug: "camera",
        category: "photography",
        excerpt: null,
        coverAltText: null,
        coverAttribution: null,
        coverHeight: null,
        coverMediaId: null,
        coverWidth: null,
        publishedAt: null,
        createdAt: new Date("2025-11-01")
      }
    ])

    const entries = await sitemap()
    const urls = entries.map((entry) => entry.url)

    expect(urls).toContain("https://paulrdrs.com/")
    expect(urls).toContain("https://paulrdrs.com/blog")
    expect(urls).toContain("https://paulrdrs.com/blog/hello")
    expect(urls).toContain("https://paulrdrs.com/projects/photography/camera")
  })
})
