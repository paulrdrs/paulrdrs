import { describe, expect, it } from "vitest"
import { isPageKey, pageKeys } from "./pages"

describe("page keys", () => {
  it("defines known page keys", () => {
    expect(pageKeys).toEqual(["home", "contact"])
  })

  it("recognizes known page keys", () => {
    expect(isPageKey("home")).toBe(true)
    expect(isPageKey("contact")).toBe(true)
    expect(isPageKey("about")).toBe(false)
  })
})
