import { buildContentMetadata } from "./metadata"

describe("buildContentMetadata", () => {
  it("builds title, description, canonical, and OpenGraph from content", () => {
    const metadata = buildContentMetadata({
      coverMediaId: "media-1",
      description: "  A summary.  ",
      path: "/blog/hello",
      title: "Hello"
    })

    expect(metadata.title).toBe("Hello")
    expect(metadata.description).toBe("A summary.")
    expect(metadata.alternates?.canonical).toBe("/blog/hello")
    expect(metadata.openGraph).toMatchObject({
      title: "Hello",
      description: "A summary.",
      type: "article",
      url: "/blog/hello",
      images: [{ url: "/media/media-1" }]
    })
  })

  it("omits description and images when absent", () => {
    const metadata = buildContentMetadata({
      coverMediaId: null,
      description: "   ",
      path: "/contact",
      title: "Contact",
      type: "website"
    })

    expect(metadata.description).toBeUndefined()
    expect(metadata.openGraph).toMatchObject({ type: "website" })
    expect((metadata.openGraph as { images?: unknown }).images).toBeUndefined()
  })
})
