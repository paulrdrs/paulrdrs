import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { upsertSiteNavigationSettings } from "@/db/siteSettings"
import { updateSiteNavigationSettingsAction } from "./actions"

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

vi.mock("@/db/siteSettings", () => ({
  upsertSiteNavigationSettings: vi.fn()
}))

const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const revalidatePathMock = vi.mocked(revalidatePath)
const upsertSiteNavigationSettingsMock = vi.mocked(upsertSiteNavigationSettings)

describe("settings dashboard actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      lastSeenAt: new Date("2026-01-01"),
      id: "session-id"
    })
  })

  it("saves navigation settings and revalidates affected routes", async () => {
    upsertSiteNavigationSettingsMock.mockResolvedValue({ id: "main" })

    const formData = new FormData()
    formData.set("blogEnabled", "on")
    formData.set("projectsEnabled", "on")
    formData.set("storeEnabled", "on")

    await expect(updateSiteNavigationSettingsAction(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/dashboard/settings"
    )

    expect(upsertSiteNavigationSettingsMock).toHaveBeenCalledWith({
      blogEnabled: true,
      photographyEnabled: false,
      projectsEnabled: true,
      softwareEnabled: false,
      storeEnabled: true
    })
    expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout")
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/settings")
    expect(redirect).toHaveBeenCalledWith("/dashboard/settings")
  })
})
