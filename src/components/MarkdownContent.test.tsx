import { render, screen } from "@testing-library/react"
import { MarkdownContent } from "./MarkdownContent"

describe("MarkdownContent", () => {
  it("renders common Markdown elements", () => {
    render(
      <MarkdownContent
        markdown={[
          "# A heading",
          "",
          "A paragraph with **strong text** and [a link](https://example.com).",
          "",
          "- First item",
          "- Second item"
        ].join("\n")}
      />
    )

    expect(
      screen.getByRole("heading", { level: 1, name: "A heading" })
    ).toBeInTheDocument()
    expect(screen.getByText("strong text")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "a link" })).toHaveAttribute(
      "href",
      "https://example.com"
    )
    expect(screen.getByText("First item")).toBeInTheDocument()
  })

  it("renders GitHub-flavored Markdown tables", () => {
    render(<MarkdownContent markdown={"| Name |\n| --- |\n| paulrdrs |"} />)

    expect(screen.getByRole("table")).toBeInTheDocument()
    expect(screen.getByText("paulrdrs")).toBeInTheDocument()
  })

  it("does not render raw HTML as executable elements", () => {
    const { container } = render(
      <MarkdownContent markdown={'<script>alert("xss")</script>'} />
    )

    expect(container.querySelector("script")).not.toBeInTheDocument()
  })
})
