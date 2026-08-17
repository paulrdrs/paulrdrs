import { render, screen } from "@testing-library/react"
import { SoftwareProjectList } from "./SoftwareProjectList"

describe("SoftwareProjectList", () => {
  it("uses two columns when more than one project is present", () => {
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
    expect(items[0]).toHaveClass("w-full", "sm:w-1/2")
    expect(items[1]).toHaveClass("w-full", "sm:w-1/2")
    expect(items[2]).toHaveClass("w-full", "sm:w-1/2")
  })

  it("keeps a single project full width", () => {
    render(
      <SoftwareProjectList
        projects={[
          {
            coverMediaId: null,
            excerpt: null,
            id: "only-project",
            slug: "only-project",
            title: "Only project"
          }
        ]}
      />
    )

    expect(screen.getByRole("listitem")).toHaveClass("w-full")
    expect(screen.getByRole("listitem")).not.toHaveClass("sm:w-1/2")
  })
})
