import { render, screen } from "@testing-library/react"
import { PostList } from "./PostList"

describe("PostList", () => {
  it("renders posts as standard list items", () => {
    render(
      <PostList
        posts={[
          {
            coverMediaId: null,
            excerpt: null,
            id: "first-post",
            publishedAt: new Date("2026-01-01"),
            slug: "first-post",
            title: "First post"
          },
          {
            coverMediaId: null,
            excerpt: null,
            id: "second-post",
            publishedAt: new Date("2026-01-02"),
            slug: "second-post",
            title: "Second post"
          },
          {
            coverMediaId: null,
            excerpt: null,
            id: "third-post",
            publishedAt: new Date("2026-01-03"),
            slug: "third-post",
            title: "Third post"
          },
          {
            coverMediaId: null,
            excerpt: null,
            id: "fourth-post",
            publishedAt: new Date("2026-01-04"),
            slug: "fourth-post",
            title: "Fourth post"
          }
        ]}
      />
    )

    expect(screen.getByRole("list")).not.toHaveClass("flex", "flex-wrap")
    for (const item of screen.getAllByRole("listitem")) {
      expect(item).not.toHaveClass("w-full", "lg:w-1/2")
    }
  })
})
