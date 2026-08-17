import { render } from "@testing-library/react"
import { SoftwareProjectList } from "./SoftwareProjectList"

describe("SoftwareProjectList", () => {
  it("uses two columns when more than one project is present", () => {
    const { container } = render(
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

    const projectList = container.querySelector(
      '[data-component="SoftwareProjectList"]'
    )

    expect(projectList).toHaveClass("flex", "flex-wrap")
    expect(projectList?.children[0]).toHaveClass("w-full", "sm:w-1/2")
    expect(projectList?.children[1]).toHaveClass("w-full", "sm:w-1/2")
    expect(projectList?.children[2]).toHaveClass("w-full", "sm:w-1/2")
  })

  it("keeps a single project full width", () => {
    const { container } = render(
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

    const projectList = container.querySelector(
      '[data-component="SoftwareProjectList"]'
    )

    expect(projectList?.children[0]).toHaveClass("w-full")
    expect(projectList?.children[0]).not.toHaveClass("sm:w-1/2")
  })
})
