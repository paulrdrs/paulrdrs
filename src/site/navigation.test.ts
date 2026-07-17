import {
  defaultSiteNavigationSettings,
  parseSiteNavigationSettingsForm
} from "./navigation"

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

  it("parses checked checkbox fields as enabled", () => {
    const formData = new FormData()
    formData.set("blogEnabled", "on")
    formData.set("photographyEnabled", "on")
    formData.set("projectsEnabled", "on")
    formData.set("softwareEnabled", "on")
    formData.set("storeEnabled", "on")

    expect(parseSiteNavigationSettingsForm(formData)).toEqual({
      blogEnabled: true,
      photographyEnabled: true,
      projectsEnabled: true,
      softwareEnabled: true,
      storeEnabled: true
    })
  })

  it("parses missing checkbox fields as disabled", () => {
    const formData = new FormData()
    formData.set("blogEnabled", "on")
    formData.set("softwareEnabled", "on")

    expect(parseSiteNavigationSettingsForm(formData)).toEqual({
      blogEnabled: true,
      photographyEnabled: false,
      projectsEnabled: false,
      softwareEnabled: true,
      storeEnabled: false
    })
  })
})
