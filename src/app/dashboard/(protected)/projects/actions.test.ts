import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import {
  createDashboardProject,
  updateDashboardProject
} from "@/db/adminContent"
import { createProjectAction, updateProjectAction } from "./actions"

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
  createDashboardProject: vi.fn(),
  updateDashboardProject: vi.fn()
}))

const createDashboardProjectMock = vi.mocked(createDashboardProject)
const updateDashboardProjectMock = vi.mocked(updateDashboardProject)
const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const revalidatePathMock = vi.mocked(revalidatePath)

const createFormData = (values: Record<string, string>) => {
  const formData = new FormData()

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }

  return formData
}

describe("project dashboard actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      lastSeenAt: new Date("2026-01-01"),
      id: "session-id"
    })
  })

  it("creates project drafts and redirects to the editor", async () => {
    createDashboardProjectMock.mockResolvedValue({ id: "project-id" })

    await expect(
      createProjectAction(
        createFormData({
          bodyMarkdown: "Project body",
          category: "software",
          status: "draft",
          title: "Draft Project"
        })
      )
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard/projects/project-id")

    expect(createDashboardProjectMock).toHaveBeenCalledWith(
      expect.objectContaining({
        bodyMarkdown: "Project body",
        category: "software",
        slug: "draft-project",
        status: "draft",
        title: "Draft Project"
      })
    )
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/projects")
    expect(revalidatePathMock).toHaveBeenCalledWith("/projects")
  })

  it("updates published projects", async () => {
    updateDashboardProjectMock.mockResolvedValue({ id: "project-id" })

    await expect(
      updateProjectAction(
        "project-id",
        createFormData({
          bodyMarkdown: "Updated project",
          category: "photography",
          publishedAt: "2026-06-08T10:00",
          status: "published",
          title: "Updated Project"
        })
      )
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard/projects/project-id")

    expect(updateDashboardProjectMock).toHaveBeenCalledWith(
      "project-id",
      expect.objectContaining({
        bodyMarkdown: "Updated project",
        category: "photography",
        slug: "updated-project",
        status: "published",
        title: "Updated Project"
      })
    )
    expect(redirect).toHaveBeenCalledWith("/dashboard/projects/project-id")
  })
})
