import { render, screen, within } from "@testing-library/react"
import { SoftwareProjectSnippet } from "./SoftwareProjectSnippet"

describe("SoftwareProjectSnippet", () => {
  it("places project content in front of its cover image", () => {
    render(
      <SoftwareProjectSnippet
        coverAltText="A software interface"
        coverAttribution="Image attribution"
        coverMediaId="cover-media-id"
        excerpt="A concise project description."
        href="/software/project"
        label="software project"
        title="Project title"
      />
    )

    const content = screen.getByTestId("content")

    expect(
      within(content).getByRole("img", { name: "A software interface" })
    ).toHaveAttribute(
      "src",
      expect.stringContaining("url=%2Fmedia%2Fcover-media-id")
    )
    expect(within(content).getByText("software project")).toBeInTheDocument()
    expect(
      within(content).getByRole("heading", { name: "Project title" })
    ).toBeInTheDocument()
    expect(
      within(content).getByText("A concise project description.")
    ).toBeInTheDocument()
    expect(within(content).getByText("Image attribution")).toBeInTheDocument()
  })
})
