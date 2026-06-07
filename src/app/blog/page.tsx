import Link from "next/link"
import { PageContainer } from "@/components/PageContainer"
import { getPublishedPosts } from "@/db/content"

export const dynamic = "force-dynamic"

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <PageContainer>
      <h1 className="font-black text-3xl">Blog</h1>

      {posts.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li className="flex flex-col gap-1" key={post.id}>
              <Link
                className="font-black text-xl hover:underline"
                href={`/blog/${post.slug}`}
              >
                {post.title}
              </Link>
              {post.excerpt ? (
                <p className="font-medium">{post.excerpt}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-medium">No posts published yet.</p>
      )}
    </PageContainer>
  )
}
