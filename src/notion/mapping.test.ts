import {
  mapPagePage,
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
const externalFile = (url: string) => ({
  files: [{ external: { url }, type: "external" }]
})

const basePostProperties = (overrides: Record<string, unknown> = {}) => ({
  Cover: externalFile("https://example.com/cover.png"),
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
      coverImage: { type: "external", url: "https://example.com/cover.png" },
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
        Cover: { files: [] },
        Excerpt: richText("  "),
        "SEO Description": richText(""),
        "SEO Title": richText(""),
        Tags: multiSelect([])
      })
    )

    const mapped = mapPostPage(page)

    expect(mapped.coverImage).toBeNull()
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
    Category: select("software"),
    ...overrides
  })

  it("maps category and carries no tags or links", () => {
    const page = buildPage(baseProjectProperties(), "project-1")
    const mapped = mapProjectPage(page)

    expect(mapped.category).toBe("software")
    expect(mapped).not.toHaveProperty("tags")
    expect(mapped).not.toHaveProperty("links")
  })

  it("throws a malformed-page error for an invalid category", () => {
    const page = buildPage(
      baseProjectProperties({ Category: select("not-a-category") }),
      "project-2"
    )

    expect(() => mapProjectPage(page)).toThrow(
      /Malformed Notion project page project-2/
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
