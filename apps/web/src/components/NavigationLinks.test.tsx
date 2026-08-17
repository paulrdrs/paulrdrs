import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { usePathname } from "next/navigation"
import { getCurrentNavigationHref, NavigationLinks } from "./NavigationLinks"

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

  it("marks the matching section link as the current page", () => {
    usePathnameMock.mockReturnValue("/photography/field-notes-serra")

    render(
      <NavigationLinks
        items={[
          { href: "/", label: "Home" },
          { href: "/photography", label: "Photography" }
        ]}
      />
    )

    expect(screen.getByRole("link", { name: "Photography" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(screen.getByRole("link", { name: "Photography" })).toHaveClass(
      "font-black"
    )
    expect(screen.getByRole("link", { name: "Photography" })).not.toHaveClass(
      "text-muted"
    )
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current"
    )
  })

  it("uses the most-specific matching link for nested paths", () => {
    expect(
      getCurrentNavigationHref(
        [
          { href: "/", label: "Home" },
          { href: "/software", label: "Software" },
          { href: "/software/tools", label: "Tools" }
        ],
        "/software/tools/contrast-checker"
      )
    ).toBe("/software/tools")
  })
})
