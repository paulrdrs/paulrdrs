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
          { href: "/projects", label: "Projects" }
        ]}
      />
    )

    const projectsLink = screen.getByRole("link", { name: "Projects" })
    projectsLink.addEventListener("click", (event) => event.preventDefault())
    projectsLink.scrollIntoView = scrollIntoView

    await user.click(projectsLink)

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    })
  })
})
