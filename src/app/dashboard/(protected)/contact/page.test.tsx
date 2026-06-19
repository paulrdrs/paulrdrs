import { render, screen } from "@testing-library/react"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardPage } from "@/db/adminContent"
import DashboardContactPage from "./page"

vi.mock("@/auth/guards", () => ({
  requireDashboardSession: vi.fn()
}))

vi.mock("@/db/adminContent", () => ({
  getDashboardPage: vi.fn()
}))

const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const getDashboardPageMock = vi.mocked(getDashboardPage)

describe("DashboardContactPage", () => {
  beforeEach(() => {
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      id: "session-id"
    })
  })

  it("renders the contact page editor with existing content", async () => {
    getDashboardPageMock.mockResolvedValue({
      bodyMarkdown: "Contact **details**.",
      createdAt: new Date("2026-01-01"),
      id: "contact-id",
      key: "contact",
      metadata: null,
      publishedAt: new Date("2026-01-02"),
      status: "published",
      title: "Reach me",
      updatedAt: new Date("2026-01-03")
    })

    render(await DashboardContactPage())

    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument()
    expect(screen.getByLabelText("Title")).toHaveValue("Reach me")
    expect(screen.getByLabelText("Markdown body")).toHaveValue(
      "Contact **details**."
    )
    expect(
      screen.getByRole("button", { name: "Save page" })
    ).toBeInTheDocument()
  })
})
