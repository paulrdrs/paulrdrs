import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { usePathname } from "next/navigation"
import { NavigationLinks } from "./NavigationLinks"

vi.mock("next/navigation", () => ({
  usePathname: vi.fn()
}))

const usePathnameMock = vi.mocked(usePathname)

describe("NavigationLinks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    usePathnameMock.mockReturnValue("/")
  })

  it("smoothly centers a navigation item when pressed", async () => {
    const user = userEvent.setup()
    const scrollIntoView = vi.fn()

    render(
      <NavigationLinks
        items={[
          { href: "/", label: "Home" },
          { href: "/software", label: "Software" }
        ]}
      />
    )

    const softwareLink = screen.getByRole("link", { name: "Software" })
    softwareLink.addEventListener("click", (event) => event.preventDefault())
    softwareLink.scrollIntoView = scrollIntoView

    await user.click(softwareLink)

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    })
  })
})
