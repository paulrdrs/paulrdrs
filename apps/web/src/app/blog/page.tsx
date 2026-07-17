import { PageContainer } from "@/components/PageContainer"
import { PostList } from "@/components/PostList"
import { getPublishedPosts } from "@/db/content"

export const dynamic = "force-dynamic"

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <PageContainer>
      <header className="pb-2">
        <h1 className="page-title">Blog</h1>
      </header>

      {posts.length > 0 ? (
        <PostList posts={posts} />
      ) : (
        <div className="empty-state">No posts published yet.</div>
      )}
    </PageContainer>
  )
}
