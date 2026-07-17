import { defaultSiteNavigationSettings } from "./navigation"

describe("site navigation settings", () => {
  it("defaults every main section to enabled", () => {
    expect(defaultSiteNavigationSettings).toEqual({
      blogEnabled: true,
      photographyEnabled: true,
      softwareEnabled: true,
      storeEnabled: true
    })
  })
})
