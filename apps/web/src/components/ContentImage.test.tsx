import { render, screen } from "@testing-library/react"
import { ContentImage } from "./ContentImage"

describe("ContentImage", () => {
  it("emits responsive Next.js image variants for stored media", () => {
    render(<ContentImage alt="A landscape" id="media-id" />)

    const image = screen.getByRole("img", { name: "A landscape" })
    const sourceSet = image.getAttribute("srcset")

    expect(image).toHaveAttribute("sizes", "(min-width: 1024px) 60vw, 100vw")
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("url=%2Fmedia%2Fmedia-id")
    )
    expect(sourceSet).toContain("/_next/image?")
    expect(sourceSet).toContain("w=640")
    expect(sourceSet).toContain("w=3840")
  })
})
