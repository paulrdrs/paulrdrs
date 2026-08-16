import { render, screen } from "@testing-library/react"
import { SoftwareProjectList } from "./SoftwareProjectList"

describe("SoftwareProjectList", () => {
  it("makes the first project full width and later projects two columns", () => {
    render(
      <SoftwareProjectList
        projects={[
          {
            coverMediaId: null,
            excerpt: null,
            id: "first-project",
            slug: "first-project",
            title: "First project"
          },
          {
            coverMediaId: null,
            excerpt: null,
            id: "second-project",
            slug: "second-project",
            title: "Second project"
          },
          {
            coverMediaId: null,
            excerpt: null,
            id: "third-project",
            slug: "third-project",
            title: "Third project"
          }
        ]}
      />
    )

    const items = screen.getAllByRole("listitem")

    expect(screen.getByRole("list")).toHaveClass("flex", "flex-wrap")
    expect(items[0]).toHaveClass("w-full")
    expect(items[0]).not.toHaveClass("sm:w-1/2")
    expect(items[1]).toHaveClass("w-full", "sm:w-1/2")
    expect(items[2]).toHaveClass("w-full", "sm:w-1/2")
  })
})
