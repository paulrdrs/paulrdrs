import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardPage, upsertDashboardPage } from "@/db/adminContent"
import { getFeaturedHeroContent } from "@/db/content"
import { updatePageAction } from "./pages"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  })
}))

vi.mock("@/auth/guards", () => ({
  requireDashboardSession: vi.fn()
}))

vi.mock("@/db/adminContent", () => ({
  getDashboardPage: vi.fn(),
  upsertDashboardPage: vi.fn()
}))

vi.mock("@/db/content", () => ({
  getFeaturedHeroContent: vi.fn()
}))

const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const getDashboardPageMock = vi.mocked(getDashboardPage)
const getFeaturedHeroContentMock = vi.mocked(getFeaturedHeroContent)
const revalidatePathMock = vi.mocked(revalidatePath)
const upsertDashboardPageMock = vi.mocked(upsertDashboardPage)

const createFormData = (values: Record<string, string>) => {
  const formData = new FormData()

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }

  return formData
}

describe("page dashboard actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      lastSeenAt: new Date("2026-01-01"),
      id: "session-id"
    })
    getDashboardPageMock.mockResolvedValue(undefined as never)
    getFeaturedHeroContentMock.mockResolvedValue(undefined)
  })

  it("upserts contact content and revalidates public contact", async () => {
    upsertDashboardPageMock.mockResolvedValue({ key: "contact" })

    await expect(
      updatePageAction(
        "contact",
        createFormData({
          bodyMarkdown: "Reach me here.",
          status: "published",
          title: "Contact"
        })
      )
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard/contact")

    expect(upsertDashboardPageMock).toHaveBeenCalledWith(
      "contact",
      expect.objectContaining({
        bodyMarkdown: "Reach me here.",
        status: "published",
        title: "Contact"
      })
    )
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/contact")
    expect(revalidatePathMock).toHaveBeenCalledWith("/contact")
    expect(redirect).toHaveBeenCalledWith("/dashboard/contact")
  })

  it("revalidates the homepage route for home content", async () => {
    upsertDashboardPageMock.mockResolvedValue({ key: "home" })

    await expect(
      updatePageAction(
        "home",
        createFormData({
          bodyMarkdown: "Homepage intro.",
          status: "draft",
          title: "Home"
        })
      )
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard/home")

    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/home")
    expect(revalidatePathMock).toHaveBeenCalledWith("/")
    expect(redirect).toHaveBeenCalledWith("/dashboard/home")
  })

  it("persists a validated homepage hero selection in metadata", async () => {
    getFeaturedHeroContentMock.mockResolvedValue({
      coverAltText: null,
      coverAttribution: null,
      coverHeight: null,
      coverMediaId: null,
      coverWidth: null,
      excerpt: "Featured post",
      href: "/blog/featured",
      id: "post-id",
      kind: "post",
      label: "From the blog",
      publishedAt: new Date("2026-01-01"),
      slug: "featured",
      title: "Featured"
    })
    upsertDashboardPageMock.mockResolvedValue({ key: "home" })

    await expect(
      updatePageAction(
        "home",
        createFormData({
          bodyMarkdown: "Homepage intro.",
          heroSelection: "post:post-id",
          status: "published",
          title: "Home"
        })
      )
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard/home")

    expect(upsertDashboardPageMock).toHaveBeenCalledWith(
      "home",
      expect.objectContaining({
        metadata: { hero: { id: "post-id", kind: "post" } }
      })
    )
  })

  it("rejects hero content without a public destination", async () => {
    await expect(
      updatePageAction(
        "home",
        createFormData({
          bodyMarkdown: "Homepage intro.",
          heroSelection: "post:draft-id",
          status: "published",
          title: "Home"
        })
      )
    ).rejects.toThrow("Hero content must be publicly available")

    expect(upsertDashboardPageMock).not.toHaveBeenCalled()
  })

  it("rejects unknown page keys", async () => {
    await expect(
      updatePageAction(
        "about",
        createFormData({
          bodyMarkdown: "About",
          status: "draft",
          title: "About"
        })
      )
    ).rejects.toThrow("Unknown page key")

    expect(upsertDashboardPageMock).not.toHaveBeenCalled()
  })
})
