import type { Metadata } from "next"
import { Eyebrow } from "@/components/Eyebrow"
import { PageContainer } from "@/components/PageContainer"
import { PostList } from "@/components/PostList"
import { getPublishedPostsByTag } from "@/db/content"

export const dynamic = "force-dynamic"

type BlogTagPageProps = {
  params: Promise<{
    tag: string
  }>
}

export async function generateMetadata({
  params
}: BlogTagPageProps): Promise<Metadata> {
  const { tag } = await params

  return {
    alternates: { canonical: `/blog/tag/${encodeURIComponent(tag)}` },
    title: `Posts tagged ${tag}`
  }
}

export default async function BlogTagPage({ params }: BlogTagPageProps) {
  const { tag } = await params
  const posts = await getPublishedPostsByTag(tag)

  return (
    <PageContainer>
      <header className="flex flex-col gap-1 p-4">
        <Eyebrow label="Blog tag" />
        <h1 className="text-balance font-bold text-4xl">{tag}</h1>
      </header>
      {posts.length > 0 ? (
        <PostList posts={posts} />
      ) : (
        <div className="empty-state">No posts tagged {tag} yet.</div>
      )}
    </PageContainer>
  )
}
