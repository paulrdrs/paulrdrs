import { render, screen } from "@testing-library/react"
import DashboardLoginPage from "./page"

describe("DashboardLoginPage", () => {
  it("renders passkey sign-in", async () => {
    render(<DashboardLoginPage />)

    expect(
      screen.getByRole("heading", { name: "Dashboard login" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Sign in with passkey" })
    ).toBeInTheDocument()
  })
})
