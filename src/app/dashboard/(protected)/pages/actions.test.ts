import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { upsertDashboardPage } from "@/db/adminContent"
import { updatePageAction } from "./actions"

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
  upsertDashboardPage: vi.fn()
}))

const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
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
      id: "session-id"
    })
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
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard/pages/contact")

    expect(upsertDashboardPageMock).toHaveBeenCalledWith(
      "contact",
      expect.objectContaining({
        bodyMarkdown: "Reach me here.",
        status: "published",
        title: "Contact"
      })
    )
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/pages")
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/pages/contact")
    expect(revalidatePathMock).toHaveBeenCalledWith("/contact")
    expect(redirect).toHaveBeenCalledWith("/dashboard/pages/contact")
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
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard/pages/home")

    expect(revalidatePathMock).toHaveBeenCalledWith("/")
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
