import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { createDashboardPost, updateDashboardPost } from "@/db/adminContent"
import { createPostAction, updatePostAction } from "./actions"

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
  createDashboardPost: vi.fn(),
  updateDashboardPost: vi.fn()
}))

const createDashboardPostMock = vi.mocked(createDashboardPost)
const updateDashboardPostMock = vi.mocked(updateDashboardPost)
const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const revalidatePathMock = vi.mocked(revalidatePath)

const createFormData = (values: Record<string, string>) => {
  const formData = new FormData()

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }

  return formData
}

describe("post dashboard actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      id: "session-id"
    })
  })

  it("creates draft posts and redirects to the blog posts editor", async () => {
    createDashboardPostMock.mockResolvedValue({ id: "post-id" })

    await expect(
      createPostAction(
        createFormData({
          bodyMarkdown: "Body",
          status: "draft",
          title: "Draft Post"
        })
      )
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard/blog/posts/post-id")

    expect(createDashboardPostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        bodyMarkdown: "Body",
        slug: "draft-post",
        status: "draft",
        title: "Draft Post"
      })
    )
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/blog/posts")
    expect(revalidatePathMock).toHaveBeenCalledWith("/blog")
  })

  it("updates published posts", async () => {
    updateDashboardPostMock.mockResolvedValue({ id: "post-id" })

    await expect(
      updatePostAction(
        "post-id",
        createFormData({
          bodyMarkdown: "Updated body",
          publishedAt: "2026-06-08T10:00",
          slug: "updated-post",
          status: "published",
          title: "Updated Post"
        })
      )
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard/blog/posts/post-id")

    expect(updateDashboardPostMock).toHaveBeenCalledWith(
      "post-id",
      expect.objectContaining({
        bodyMarkdown: "Updated body",
        slug: "updated-post",
        status: "published",
        title: "Updated Post"
      })
    )
    expect(redirect).toHaveBeenCalledWith("/dashboard/blog/posts/post-id")
  })
})
