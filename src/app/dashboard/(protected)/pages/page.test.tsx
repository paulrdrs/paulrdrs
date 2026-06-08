import { render, screen } from "@testing-library/react"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardPages } from "@/db/adminContent"
import DashboardPagesPage from "./page"

vi.mock("@/auth/guards", () => ({
  requireDashboardSession: vi.fn()
}))

vi.mock("@/db/adminContent", () => ({
  getDashboardPages: vi.fn()
}))

const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const getDashboardPagesMock = vi.mocked(getDashboardPages)

describe("DashboardPagesPage", () => {
  beforeEach(() => {
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      id: "session-id"
    })
  })

  it("renders fixed page keys with edit links", async () => {
    getDashboardPagesMock.mockResolvedValue([
      {
        createdAt: new Date("2026-01-01"),
        id: "contact-id",
        key: "contact",
        publishedAt: new Date("2026-01-02"),
        status: "published",
        title: "Reach me",
        updatedAt: new Date("2026-01-03")
      }
    ])

    render(await DashboardPagesPage())

    expect(screen.getByRole("heading", { name: "Pages" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/dashboard/pages/home"
    )
    expect(screen.getByRole("link", { name: "Reach me" })).toHaveAttribute(
      "href",
      "/dashboard/pages/contact"
    )
    expect(screen.getByText("missing")).toBeInTheDocument()
    expect(screen.getByText("published")).toBeInTheDocument()
  })
})
