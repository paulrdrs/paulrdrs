import { render, screen } from "@testing-library/react"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardPage } from "@/db/adminContent"
import DashboardHomePage from "./page"

vi.mock("@/auth/guards", () => ({
  requireDashboardSession: vi.fn()
}))

vi.mock("@/db/adminContent", () => ({
  getDashboardHeroOptions: vi.fn(async () => ({
    media: [],
    posts: [],
    projects: []
  })),
  getDashboardPage: vi.fn()
}))

vi.mock("../_actions/pages", () => ({
  updatePageAction: vi.fn()
}))

const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const getDashboardPageMock = vi.mocked(getDashboardPage)

describe("DashboardHomePage", () => {
  beforeEach(() => {
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      lastSeenAt: new Date("2026-01-01"),
      id: "session-id"
    })
  })

  it("renders the home page editor with existing content", async () => {
    getDashboardPageMock.mockResolvedValue({
      bodyMarkdown: "Homepage **intro**.",
      createdAt: new Date("2026-01-01"),
      id: "home-id",
      key: "home",
      metadata: null,
      publishedAt: new Date("2026-01-02"),
      status: "published",
      title: "Home intro",
      updatedAt: new Date("2026-01-03")
    })

    render(await DashboardHomePage())

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument()
    expect(screen.getByLabelText("Title")).toHaveValue("Home intro")
    expect(screen.getByLabelText("Markdown body")).toHaveValue(
      "Homepage **intro**."
    )
    expect(
      screen.getByRole("button", { name: "Save page" })
    ).toBeInTheDocument()
  })

  it("renders the default draft editor when home content is missing", async () => {
    getDashboardPageMock.mockResolvedValue(undefined as never)

    render(await DashboardHomePage())

    expect(screen.getByLabelText("Title")).toHaveValue("Home")
    expect(screen.getByText("Nothing to preview yet.")).toBeInTheDocument()
  })
})
