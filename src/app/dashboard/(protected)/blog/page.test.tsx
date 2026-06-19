import { redirect } from "next/navigation"
import DashboardBlogPage from "./page"

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  })
}))

describe("DashboardBlogPage", () => {
  it("redirects to blog posts", () => {
    expect(() => DashboardBlogPage()).toThrow(
      "NEXT_REDIRECT:/dashboard/blog/posts"
    )

    expect(redirect).toHaveBeenCalledWith("/dashboard/blog/posts")
  })
})
