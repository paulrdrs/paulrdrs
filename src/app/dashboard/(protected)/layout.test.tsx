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
    expect(screen.getAllByRole("link")).toEqual([
      expect.objectContaining({
        href: "http://localhost:3000/dashboard",
        textContent: "Overview"
      }),
      expect.objectContaining({
        href: "http://localhost:3000/dashboard/home",
        textContent: "Home"
      }),
      expect.objectContaining({
        href: "http://localhost:3000/dashboard/contact",
        textContent: "Contact"
      }),
      expect.objectContaining({
        href: "http://localhost:3000/dashboard/blog",
        textContent: "blog"
      }),
      expect.objectContaining({
        href: "http://localhost:3000/dashboard/projects",
        textContent: "Projects"
      }),
      expect.objectContaining({
        href: "http://localhost:3000/dashboard/media",
        textContent: "Media"
      }),
      expect.objectContaining({
        href: "http://localhost:3000/dashboard/settings",
        textContent: "Settings"
      }),
      expect.objectContaining({
        href: "http://localhost:3000/dashboard/passkeys",
        textContent: "Passkeys"
      })
    ])
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument()
    expect(screen.getByText("Protected content")).toBeInTheDocument()
  })
})
