import { parsePageForm, parsePostForm, parseProjectForm } from "./contentForms"

const createFormData = (values: Record<string, string>) => {
  const formData = new FormData()

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }

  return formData
}

describe("content form parsing", () => {
  it("parses draft post values and creates a slug from the title", () => {
    const values = parsePostForm(
      createFormData({
        bodyMarkdown: "# Hello",
        excerpt: "",
        seoDescription: "",
        seoTitle: "",
        status: "draft",
        title: "Hello CMS Post"
      })
    )

    expect(values).toEqual({
      bodyMarkdown: "# Hello",
      coverMediaId: null,
      excerpt: null,
      publishedAt: null,
      seoDescription: null,
      seoTitle: null,
      slug: "hello-cms-post",
      status: "draft",
      title: "Hello CMS Post"
    })
  })

  it("parses published post values with an explicit publish date", () => {
    const values = parsePostForm(
      createFormData({
        bodyMarkdown: "Published body",
        publishedAt: "2026-06-08T09:30",
        slug: "custom-post",
        status: "published",
        title: "Published Post"
      })
    )

    expect(values.status).toBe("published")
    expect(values.slug).toBe("custom-post")
    expect(values.coverMediaId).toBeNull()
    expect(values.publishedAt?.getFullYear()).toBe(2026)
    expect(values.publishedAt?.getMonth()).toBe(5)
    expect(values.publishedAt?.getDate()).toBe(8)
    expect(values.publishedAt?.getHours()).toBe(9)
    expect(values.publishedAt?.getMinutes()).toBe(30)
  })

  it("parses project category values", () => {
    const values = parseProjectForm(
      createFormData({
        bodyMarkdown: "Project body",
        category: "photography",
        status: "published",
        title: "Photo Project"
      })
    )

    expect(values.category).toBe("photography")
    expect(values.status).toBe("published")
  })

  it("rejects invalid project categories", () => {
    expect(() =>
      parseProjectForm(
        createFormData({
          category: "writing",
          status: "draft",
          title: "Project"
        })
      )
    ).toThrow("Project category is required")
  })

  it("parses page values", () => {
    const values = parsePageForm(
      createFormData({
        bodyMarkdown: "Contact **details**",
        status: "published",
        title: "Contact"
      })
    )

    expect(values).toEqual({
      bodyMarkdown: "Contact **details**",
      publishedAt: expect.any(Date),
      status: "published",
      title: "Contact"
    })
  })
})
