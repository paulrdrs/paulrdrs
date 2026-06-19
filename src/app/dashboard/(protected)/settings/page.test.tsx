import { render, screen } from "@testing-library/react"
import { requireDashboardSession } from "@/auth/guards"
import { getSiteNavigationSettings } from "@/db/siteSettings"
import DashboardSettingsPage from "./page"

vi.mock("@/auth/guards", () => ({
  requireDashboardSession: vi.fn()
}))

vi.mock("@/db/siteSettings", () => ({
  getSiteNavigationSettings: vi.fn()
}))

const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const getSiteNavigationSettingsMock = vi.mocked(getSiteNavigationSettings)

describe("DashboardSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      id: "session-id"
    })
  })

  it("renders navigation section toggles", async () => {
    getSiteNavigationSettingsMock.mockResolvedValue({
      blogEnabled: true,
      photographyEnabled: false,
      projectsEnabled: true,
      softwareEnabled: false,
      storeEnabled: true
    })

    render(await DashboardSettingsPage())

    expect(
      screen.getByRole("heading", { name: "Settings" })
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Blog")).toBeChecked()
    expect(screen.getByLabelText("Projects")).toBeChecked()
    expect(screen.getByLabelText("Photography")).not.toBeChecked()
    expect(screen.getByLabelText("Software")).not.toBeChecked()
    expect(screen.getByLabelText("Store")).toBeChecked()
    expect(
      screen.getByRole("button", { name: "Save settings" })
    ).toBeInTheDocument()
  })
})
