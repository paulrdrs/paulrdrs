import { notFound } from "next/navigation"
import { MarkdownContent } from "@/components/MarkdownContent"
import { PageContainer } from "@/components/PageContainer"
import { getPublishedPostBySlug } from "@/db/content"

export const dynamic = "force-dynamic"

type BlogPostPageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <PageContainer>
      <h1 className="font-black text-3xl">{post.title}</h1>
      {post.excerpt ? <p className="font-medium">{post.excerpt}</p> : null}
      <MarkdownContent markdown={post.bodyMarkdown} />
    </PageContainer>
  )
}
