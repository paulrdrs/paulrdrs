import { isPageKey, pageKeys } from "./pages"

describe("page keys", () => {
  it("defines supported keyed pages", () => {
    expect(pageKeys).toEqual(["home", "contact"])
  })

  it("recognizes known page keys", () => {
    expect(isPageKey("home")).toBe(true)
    expect(isPageKey("contact")).toBe(true)
    expect(isPageKey("about")).toBe(false)
  })
})
