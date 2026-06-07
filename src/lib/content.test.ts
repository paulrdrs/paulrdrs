import { createExcerpt, createSlug } from "./content"

describe("createSlug", () => {
  it("normalizes text into a URL slug", () => {
    expect(createSlug("Olá, World! This is Paulo's Site")).toBe(
      "ola-world-this-is-paulos-site"
    )
  })

  it("collapses repeated separators", () => {
    expect(createSlug("  Software   /   Photography  ")).toBe(
      "software-photography"
    )
  })
})

describe("createExcerpt", () => {
  it("creates plain text from Markdown", () => {
    expect(
      createExcerpt(
        "# Title\n\nA paragraph with **bold text**, `code`, and [a link](https://example.com)."
      )
    ).toBe("Title A paragraph with bold text, code, and a link.")
  })

  it("truncates long text", () => {
    expect(createExcerpt("One two three four five", 13)).toBe(
      "One two three..."
    )
  })
})
