import { render, screen } from "@testing-library/react"
import DashboardPasskeySetupPage from "./page"

describe("DashboardPasskeySetupPage", () => {
  it("renders passkey setup form", () => {
    render(<DashboardPasskeySetupPage />)

    expect(
      screen.getByRole("heading", { name: "Passkey setup" })
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Bootstrap secret")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Register passkey" })
    ).toBeInTheDocument()
  })
})
