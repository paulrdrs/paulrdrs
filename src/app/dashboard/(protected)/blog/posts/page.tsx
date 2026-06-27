import Link from "next/link"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardPosts } from "@/db/adminContent"

const formatDate = (date: Date | null) => {
  return date
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)
    : "-"
}

export default async function DashboardBlogPostsPage() {
  await requireDashboardSession()

  const posts = await getDashboardPosts()

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-black text-2xl">Posts</h2>
        <Link className="button" href="/dashboard/blog/posts/new">
          New post
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Published</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link
                      className="font-black hover:underline"
                      href={`/dashboard/blog/posts/${post.id}`}
                    >
                      {post.title}
                    </Link>
                    <div className="font-mono text-sm">{post.slug}</div>
                  </td>
                  <td className="font-mono text-sm">{post.status}</td>
                  <td className="font-mono text-sm">
                    {formatDate(post.publishedAt)}
                  </td>
                  <td className="font-mono text-sm">
                    {formatDate(post.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="font-medium">No posts yet.</p>
      )}
    </>
  )
}
