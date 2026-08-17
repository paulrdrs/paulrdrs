import { render } from "@testing-library/react"
import { PostList } from "./PostList"

describe("PostList", () => {
  it("renders posts in a flex column", () => {
    const { container } = render(
      <PostList
        posts={[
          {
            coverMediaId: null,
            excerpt: null,
            id: "first-post",
            publishedAt: new Date("2026-01-01"),
            slug: "first-post",
            tags: [],
            title: "First post"
          },
          {
            coverMediaId: null,
            excerpt: null,
            id: "second-post",
            publishedAt: new Date("2026-01-02"),
            slug: "second-post",
            tags: [],
            title: "Second post"
          },
          {
            coverMediaId: null,
            excerpt: null,
            id: "third-post",
            publishedAt: new Date("2026-01-03"),
            slug: "third-post",
            tags: [],
            title: "Third post"
          },
          {
            coverMediaId: null,
            excerpt: null,
            id: "fourth-post",
            publishedAt: new Date("2026-01-04"),
            slug: "fourth-post",
            tags: [],
            title: "Fourth post"
          }
        ]}
      />
    )

    const contentList = container.querySelector(
      '[data-content-list="blog-posts"]'
    )

    expect(contentList).toHaveClass("flex", "flex-col")
    expect(contentList?.querySelectorAll("a")).toHaveLength(4)
  })
})
