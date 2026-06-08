import Link from "next/link"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardPosts } from "@/db/adminContent"

const formatDate = (date: Date | null) => {
  return date
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)
    : "-"
}

export default async function DashboardPostsPage() {
  await requireDashboardSession()

  const posts = await getDashboardPosts()

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-black text-2xl">Posts</h2>
        <Link
          className="border border-current px-3 py-2 font-mono text-sm hover:bg-black hover:text-white"
          href="/dashboard/posts/new"
        >
          New post
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-current border-b font-mono text-sm">
              <tr>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Published</th>
                <th className="py-2 pr-4">Updated</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr className="border-current border-b" key={post.id}>
                  <td className="py-3 pr-4">
                    <Link
                      className="font-black hover:underline"
                      href={`/dashboard/posts/${post.id}`}
                    >
                      {post.title}
                    </Link>
                    <div className="font-mono text-sm">{post.slug}</div>
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm">{post.status}</td>
                  <td className="py-3 pr-4 font-mono text-sm">
                    {formatDate(post.publishedAt)}
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm">
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
