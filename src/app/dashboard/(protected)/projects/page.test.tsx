import { render, screen } from "@testing-library/react"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardProjects } from "@/db/adminContent"
import DashboardProjectsPage from "./page"

vi.mock("@/auth/guards", () => ({
  requireDashboardSession: vi.fn()
}))

vi.mock("@/db/adminContent", () => ({
  getDashboardProjects: vi.fn()
}))

const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const getDashboardProjectsMock = vi.mocked(getDashboardProjects)

describe("DashboardProjectsPage", () => {
  beforeEach(() => {
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      id: "session-id"
    })
  })

  it("renders dashboard projects with edit links", async () => {
    getDashboardProjectsMock.mockResolvedValue([
      {
        category: "software",
        createdAt: new Date("2026-01-01"),
        id: "project-id",
        publishedAt: new Date("2026-01-02"),
        slug: "hello-project",
        status: "published",
        title: "Hello Project",
        updatedAt: new Date("2026-01-03")
      }
    ])

    render(await DashboardProjectsPage())

    expect(
      screen.getByRole("heading", { name: "Projects" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "New project" })).toHaveAttribute(
      "href",
      "/dashboard/projects/new"
    )
    expect(screen.getByRole("link", { name: "Hello Project" })).toHaveAttribute(
      "href",
      "/dashboard/projects/project-id"
    )
    expect(screen.getByText("software")).toBeInTheDocument()
    expect(screen.getByText("published")).toBeInTheDocument()
  })

  it("renders an empty state", async () => {
    getDashboardProjectsMock.mockResolvedValue([])

    render(await DashboardProjectsPage())

    expect(screen.getByText("No projects yet.")).toBeInTheDocument()
  })
})
