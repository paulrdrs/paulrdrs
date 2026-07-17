import { isPageKey, pageKeys, pageLabels } from "./pages"

describe("page keys", () => {
  it("defines editable keyed pages", () => {
    expect(pageKeys).toEqual(["home", "contact"])
    expect(pageLabels).toEqual({
      contact: "Contact",
      home: "Home"
    })
  })

  it("recognizes known page keys", () => {
    expect(isPageKey("home")).toBe(true)
    expect(isPageKey("contact")).toBe(true)
    expect(isPageKey("about")).toBe(false)
  })
})
