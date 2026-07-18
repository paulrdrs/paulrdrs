import {
  getCurrentNavigationHref,
  type NavigationItem
} from "./NavigationLinks"

const items: NavigationItem[] = [
  { href: "/", label: "Home" },
  { href: "/photography", label: "Photography" },
  { href: "/software", label: "Software" }
]

describe("getCurrentNavigationHref", () => {
  it("uses the most specific matching navigation item", () => {
    expect(getCurrentNavigationHref(items, "/software/tool")).toBe("/software")
    expect(
      getCurrentNavigationHref(items, "/photography/portrait-series")
    ).toBe("/photography")
  })

  it("does not match removed project routes", () => {
    expect(getCurrentNavigationHref(items, "/projects")).toBeUndefined()
  })
})
