import {
  mapPagePage,
  mapPhotoPage,
  mapPostPage,
  mapProjectPage,
  type NotionPage
} from "./mapping"

const buildPage = (
  properties: Record<string, unknown>,
  id = "page-id"
): NotionPage => ({
  id,
  properties
})

const title = (text: string) => ({ title: [{ plain_text: text }] })
const richText = (text: string) => ({ rich_text: [{ plain_text: text }] })
const status = (name: string) => ({ status: { name } })
const select = (name: string | null) => ({ select: name ? { name } : null })
const multiSelect = (names: string[]) => ({
  multi_select: names.map((name) => ({ name }))
})
const date = (start: string | null) => ({ date: start ? { start } : null })
const uniqueId = (number: number) => ({
  unique_id: { number, prefix: null }
})
const basePostProperties = (overrides: Record<string, unknown> = {}) => ({
  Excerpt: richText("An excerpt"),
  "SEO Description": richText("SEO description"),
  "SEO Title": richText("SEO title"),
  Slug: richText("custom-slug"),
  Status: status("Published"),
  Tags: multiSelect(["tag-a", "tag-b"]),
  Title: title("Hello World"),
  Published: date("2024-05-01T00:00:00.000Z"),
  ...overrides
})

describe("mapPostPage", () => {
  it("maps a fully populated post page", () => {
    const page = buildPage(basePostProperties(), "post-1")

    expect(mapPostPage(page)).toEqual({
      excerpt: "An excerpt",
      notionPageId: "post-1",
      publishedAt: new Date("2024-05-01T00:00:00.000Z"),
      seoDescription: "SEO description",
      seoTitle: "SEO title",
      slug: "custom-slug",
      status: "published",
      tags: ["tag-a", "tag-b"],
      title: "Hello World"
    })
  })

  it("maps Draft status and a null Published date", () => {
    const page = buildPage(
      basePostProperties({ Published: date(null), Status: status("Draft") })
    )

    const mapped = mapPostPage(page)

    expect(mapped.status).toBe("draft")
    expect(mapped.publishedAt).toBeNull()
  })

  it("treats blank optional properties as absent", () => {
    const page = buildPage(
      basePostProperties({
        Excerpt: richText("  "),
        "SEO Description": richText(""),
        "SEO Title": richText(""),
        Tags: multiSelect([])
      })
    )

    const mapped = mapPostPage(page)

    expect(mapped.excerpt).toBeNull()
    expect(mapped.seoTitle).toBeNull()
    expect(mapped.seoDescription).toBeNull()
    expect(mapped.tags).toEqual([])
  })

  it("falls back to the title-derived slug when Slug is blank", () => {
    const page = buildPage(
      basePostProperties({ Slug: richText(""), Title: title("My Great Post!") })
    )

    expect(mapPostPage(page).slug).toBe("my-great-post")
  })

  it("normalizes an explicit Slug via createSlug", () => {
    const page = buildPage(
      basePostProperties({ Slug: richText("  Hello World!! ") })
    )

    expect(mapPostPage(page).slug).toBe("hello-world")
  })

  it("throws a malformed-page error when neither Slug nor Title is sluggable", () => {
    const page = buildPage(
      basePostProperties({ Slug: richText(""), Title: title("...") }),
      "post-2"
    )

    expect(() => mapPostPage(page)).toThrow(/Malformed Notion post page post-2/)
  })

  it("throws a malformed-page error when Title is blank", () => {
    const page = buildPage(basePostProperties({ Title: title("") }), "post-3")

    expect(() => mapPostPage(page)).toThrow(/Malformed Notion post page post-3/)
  })

  it("throws a malformed-page error for an invalid Status option", () => {
    const page = buildPage(
      basePostProperties({ Status: { status: { name: "Archived" } } }),
      "post-4"
    )

    expect(() => mapPostPage(page)).toThrow(/Malformed Notion post page post-4/)
  })
})

describe("mapProjectPage", () => {
  const baseProjectProperties = (overrides: Record<string, unknown> = {}) => ({
    ...basePostProperties(),
    Order: uniqueId(1),
    ...overrides
  })

  it("takes the category from the source database", () => {
    const page = buildPage(baseProjectProperties(), "project-1")
    const mapped = mapProjectPage(page, "software")

    expect(mapped.category).toBe("software")
    expect(mapped.sortOrder).toBe(1)
    expect(mapped.status).toBe("published")
    expect(mapped).not.toHaveProperty("tags")
    expect(mapped).not.toHaveProperty("links")
  })

  it("does not require a Category property", () => {
    const page = buildPage(baseProjectProperties(), "project-2")

    expect(mapProjectPage(page, "photography").category).toBe("photography")
  })

  it("requires a positive Order unique ID", () => {
    const page = buildPage(
      baseProjectProperties({ Order: undefined }),
      "project-3"
    )

    expect(() => mapProjectPage(page, "software")).toThrow(
      /Malformed Notion project page project-3/
    )
  })
})

describe("mapPhotoPage", () => {
  const relation = (ids: string[]) => ({
    relation: ids.map((id) => ({ id }))
  })

  const basePhotoProperties = (overrides: Record<string, unknown> = {}) => ({
    Excerpt: richText("Golden hour at the pier"),
    "Photography Projects": relation(["notion-project-1", "notion-project-2"]),
    Published: date("2024-06-01T00:00:00.000Z"),
    Slug: richText("pier-at-dusk"),
    Status: status("Published"),
    Title: title("Pier at Dusk"),
    ...overrides
  })

  it("maps a fully populated photo page", () => {
    const page = buildPage(basePhotoProperties(), "photo-1")

    expect(mapPhotoPage(page)).toEqual({
      excerpt: "Golden hour at the pier",
      notionPageId: "photo-1",
      photographyProjectNotionPageIds: ["notion-project-1", "notion-project-2"],
      publishedAt: new Date("2024-06-01T00:00:00.000Z"),
      slug: "pier-at-dusk",
      status: "published",
      title: "Pier at Dusk"
    })
  })

  it("maps an empty Photography Projects relation to no links", () => {
    const page = buildPage(
      basePhotoProperties({ "Photography Projects": relation([]) })
    )

    expect(mapPhotoPage(page).photographyProjectNotionPageIds).toEqual([])
  })

  it("falls back to the title-derived slug when Slug is blank", () => {
    const page = buildPage(
      basePhotoProperties({ Slug: richText(""), Title: title("Morning Fog!") })
    )

    expect(mapPhotoPage(page).slug).toBe("morning-fog")
  })

  it("throws when the Photography Projects property is missing", () => {
    const page = buildPage(
      basePhotoProperties({ "Photography Projects": undefined }),
      "photo-2"
    )

    expect(() => mapPhotoPage(page)).toThrow(
      /Malformed Notion photo page photo-2/
    )
  })
})

describe("mapPagePage", () => {
  const basePageProperties = (overrides: Record<string, unknown> = {}) => ({
    Key: select("home"),
    Published: date("2024-01-01T00:00:00.000Z"),
    Status: status("Published"),
    Title: title("Home"),
    ...overrides
  })

  it("maps a valid keyed page", () => {
    const page = buildPage(basePageProperties(), "page-1")

    expect(mapPagePage(page)).toEqual({
      key: "home",
      notionPageId: "page-1",
      publishedAt: new Date("2024-01-01T00:00:00.000Z"),
      status: "published",
      title: "Home"
    })
  })

  it("throws a malformed-page error for an invalid Key", () => {
    const page = buildPage(
      basePageProperties({ Key: select("about") }),
      "page-2"
    )

    expect(() => mapPagePage(page)).toThrow(/Malformed Notion page page page-2/)
  })
})
