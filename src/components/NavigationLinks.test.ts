import {
  getCurrentNavigationHref,
  type NavigationItem
} from "./NavigationLinks"

const items: NavigationItem[] = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/projects/photography", label: "Photography" },
  { href: "/projects/software", label: "Software" }
]

describe("getCurrentNavigationHref", () => {
  it("uses the most specific matching navigation item", () => {
    expect(getCurrentNavigationHref(items, "/projects/software")).toBe(
      "/projects/software"
    )
    expect(
      getCurrentNavigationHref(items, "/projects/photography/portrait-series")
    ).toBe("/projects/photography")
  })

  it("keeps the projects index exact when no child route matches", () => {
    expect(getCurrentNavigationHref(items, "/projects")).toBe("/projects")
  })
})
