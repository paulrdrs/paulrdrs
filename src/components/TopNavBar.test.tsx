import { render, screen } from "@testing-library/react"
import { getCurrentSession } from "@/auth/session"
import { getSiteNavigationSettings } from "@/db/siteSettings"
import { TopNavBar } from "./TopNavBar"

vi.mock("@/auth/session", () => ({
  getCurrentSession: vi.fn()
}))

vi.mock("@/db/siteSettings", () => ({
  getSiteNavigationSettings: vi.fn()
}))

const getCurrentSessionMock = vi.mocked(getCurrentSession)
const getSiteNavigationSettingsMock = vi.mocked(getSiteNavigationSettings)

describe("TopNavBar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCurrentSessionMock.mockResolvedValue(undefined)
  })

  it("renders fixed links and enabled section links", async () => {
    getSiteNavigationSettingsMock.mockResolvedValue({
      blogEnabled: true,
      photographyEnabled: false,
      projectsEnabled: true,
      softwareEnabled: false,
      storeEnabled: true
    })

    render(await TopNavBar())

    expect(screen.getByRole("link", { name: "paulrdrs" })).toHaveAttribute(
      "href",
      "/"
    )
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "href",
      "/blog"
    )
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/projects"
    )
    expect(screen.getByRole("link", { name: "Store" })).toHaveAttribute(
      "href",
      "/store"
    )
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact"
    )
    expect(
      screen.queryByRole("link", { name: "Photography" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: "Software" })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: "Dashboard" })
    ).not.toBeInTheDocument()
  })

  it("renders dashboard as the last link for authenticated users", async () => {
    getCurrentSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      lastSeenAt: new Date("2026-01-01"),
      id: "session-id"
    })
    getSiteNavigationSettingsMock.mockResolvedValue({
      blogEnabled: true,
      photographyEnabled: false,
      projectsEnabled: true,
      softwareEnabled: false,
      storeEnabled: true
    })

    render(await TopNavBar())

    const links = screen.getAllByRole("link")
    expect(links.at(-1)).toHaveTextContent("Dashboard")
    expect(links.at(-1)).toHaveAttribute("href", "/dashboard")
  })
})
