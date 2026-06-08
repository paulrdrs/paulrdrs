import { render, screen } from "@testing-library/react"
import { redirect } from "next/navigation"
import { getCurrentSession } from "@/auth/session"
import DashboardLayout from "./layout"

vi.mock("@/auth/session", () => ({
  getCurrentSession: vi.fn()
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  })
}))

const getCurrentSessionMock = vi.mocked(getCurrentSession)
const redirectMock = vi.mocked(redirect)

describe("DashboardLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirects unauthenticated users to dashboard login", async () => {
    getCurrentSessionMock.mockResolvedValue(undefined)

    await expect(
      DashboardLayout({ children: <p>Protected content</p> })
    ).rejects.toThrow("NEXT_REDIRECT:/dashboard/login")

    expect(redirectMock).toHaveBeenCalledWith("/dashboard/login")
  })

  it("renders dashboard navigation for authenticated users", async () => {
    getCurrentSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      id: "session-id"
    })

    render(await DashboardLayout({ children: <p>Protected content</p> }))

    expect(
      screen.getByRole("heading", { name: "Dashboard" })
    ).toBeInTheDocument()
    expect(screen.getByText("admin@example.com")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "/dashboard"
    )
    expect(screen.getByRole("link", { name: "Posts" })).toHaveAttribute(
      "href",
      "/dashboard/posts"
    )
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/dashboard/projects"
    )
    expect(screen.getByRole("link", { name: "Pages" })).toHaveAttribute(
      "href",
      "/dashboard/pages"
    )
    expect(screen.getByRole("link", { name: "Media" })).toHaveAttribute(
      "href",
      "/dashboard/media"
    )
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument()
    expect(screen.getByText("Protected content")).toBeInTheDocument()
  })
})
