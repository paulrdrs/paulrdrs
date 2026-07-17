import { defaultSiteNavigationSettings } from "./navigation"

describe("site navigation settings", () => {
  it("defaults every main section to enabled", () => {
    expect(defaultSiteNavigationSettings).toEqual({
      blogEnabled: true,
      photographyEnabled: true,
      projectsEnabled: true,
      softwareEnabled: true,
      storeEnabled: true
    })
  })
})
