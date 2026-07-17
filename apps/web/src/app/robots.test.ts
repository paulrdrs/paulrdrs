import robots from "./robots"

vi.mock("@/envs/server", () => ({
  getSiteEnvs: vi.fn(() => ({ SITE_URL: "https://paulrdrs.com" }))
}))

describe("robots", () => {
  it("disallows the dashboard and points at the sitemap", () => {
    const result = robots()

    expect(result.rules).toMatchObject({
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard"]
    })
    expect(result.sitemap).toBe("https://paulrdrs.com/sitemap.xml")
    expect(result.host).toBe("https://paulrdrs.com")
  })
})
