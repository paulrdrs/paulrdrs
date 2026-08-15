import { render, screen } from "@testing-library/react"
import { PostSnippet } from "./PostSnippet"

describe("PostSnippet", () => {
  it("sizes a full-width post cover for the constrained site layout", () => {
    render(
      <PostSnippet
        coverAltText="A full-width cover"
        coverMediaId="full-width-media"
        href="/blog/full-width"
        label="January 1, 2026"
        title="Full-width post"
      />
    )

    const image = screen.getByRole("img", { name: "A full-width cover" })

    expect(image).toHaveAttribute(
      "sizes",
      "(min-width: 896px) 448px, (min-width: 768px) 50vw, 100vw"
    )
    expect(screen.getByRole("link", { name: "Full-width post" })).toHaveClass(
      "flex-col",
      "sm:flex-row"
    )
    expect(image.closest("figure")).toHaveClass(
      "w-full",
      "sm:w-1/3",
      "sm:shrink-0"
    )
  })
})
