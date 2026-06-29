import { render, screen } from "@testing-library/react"
import { getSiteNavigationSettings } from "@/db/siteSettings"
import { TopNavBar } from "./TopNavBar"

vi.mock("@/db/siteSettings", () => ({
  getSiteNavigationSettings: vi.fn()
}))

const getSiteNavigationSettingsMock = vi.mocked(getSiteNavigationSettings)

describe("TopNavBar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
})
