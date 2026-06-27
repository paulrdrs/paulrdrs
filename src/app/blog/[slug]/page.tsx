import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { trackPageView } from "@/analytics/server"
import { ContentImage } from "@/components/ContentImage"
import { MarkdownContent } from "@/components/MarkdownContent"
import { PageContainer } from "@/components/PageContainer"
import { getPublishedPostBySlug } from "@/db/content"
import { buildContentMetadata } from "@/lib/metadata"

export const dynamic = "force-dynamic"

type BlogPostPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    return {}
  }

  return buildContentMetadata({
    coverMediaId: post.coverMediaId,
    description: post.seoDescription ?? post.excerpt,
    path: `/blog/${post.slug}`,
    title: post.seoTitle ?? post.title
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    notFound()
  }

  await trackPageView({
    contentId: post.id,
    contentType: "post",
    path: `/blog/${post.slug}`
  })

  return (
    <PageContainer>
      <header className="grid gap-8 pb-2 lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-10">
          <p className="eyebrow">Blog</p>
          <h1 className="page-title">{post.title}</h1>
          {post.excerpt ? (
            <p className="max-w-2xl text-muted text-xl">{post.excerpt}</p>
          ) : null}
        </div>
      </header>
      {post.coverMediaId ? (
        <ContentImage
          alt={post.coverAltText}
          attribution={post.coverAttribution}
          className="aspect-video"
          id={post.coverMediaId}
          priority
        />
      ) : null}
      <div>
        <MarkdownContent markdown={post.bodyMarkdown} />
      </div>
    </PageContainer>
  )
}
