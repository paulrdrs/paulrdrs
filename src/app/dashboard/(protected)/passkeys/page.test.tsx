import { render, screen } from "@testing-library/react"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardPasskeys } from "@/auth/passkeys"
import DashboardPasskeysPage from "./page"

vi.mock("@/auth/guards", () => ({
  requireDashboardSession: vi.fn()
}))

vi.mock("@/auth/passkeys", () => ({
  getDashboardPasskeys: vi.fn()
}))

const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const getDashboardPasskeysMock = vi.mocked(getDashboardPasskeys)

describe("DashboardPasskeysPage", () => {
  beforeEach(() => {
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      lastSeenAt: new Date("2026-01-01"),
      id: "session-id"
    })
  })

  it("renders registered passkeys", async () => {
    getDashboardPasskeysMock.mockResolvedValue([
      {
        createdAt: new Date("2026-06-01"),
        credentialDeviceType: "multiDevice",
        email: "admin@example.com",
        id: "passkey-id",
        lastUsedAt: new Date("2026-06-08"),
        transports: ["internal"]
      }
    ])

    render(await DashboardPasskeysPage())

    expect(
      screen.getByRole("heading", { name: "Passkeys" })
    ).toBeInTheDocument()
    expect(screen.getByText("admin@example.com")).toBeInTheDocument()
    expect(screen.getByText("multiDevice")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled()
  })

  it("renders an empty state", async () => {
    getDashboardPasskeysMock.mockResolvedValue([])

    render(await DashboardPasskeysPage())

    expect(screen.getByText("No passkeys registered.")).toBeInTheDocument()
  })
})
