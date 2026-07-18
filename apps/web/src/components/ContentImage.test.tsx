import { render, screen } from "@testing-library/react"
import { ContentImage } from "./ContentImage"

describe("ContentImage", () => {
  it("emits responsive Next.js image variants for stored media", () => {
    render(<ContentImage alt="A landscape" id="media-id" />)

    const image = screen.getByRole("img", { name: "A landscape" })
    const sourceSet = image.getAttribute("srcset")

    expect(image).toHaveAttribute(
      "sizes",
      "(min-width: 1024px) 960px, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2rem)"
    )
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("url=%2Fmedia%2Fmedia-id")
    )
    expect(sourceSet).toContain("/_next/image?")
    expect(sourceSet).toContain("w=640")
    expect(sourceSet).toContain("w=3840")
  })

  it("uses card-specific responsive sizes", () => {
    render(<ContentImage alt="A card" id="media-id" presentation="photoCard" />)

    expect(screen.getByRole("img", { name: "A card" })).toHaveAttribute(
      "sizes",
      "(min-width: 1024px) 299px, (min-width: 640px) calc(50vw - 3rem), calc(100vw - 2rem)"
    )
  })
})
