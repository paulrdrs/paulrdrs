import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { trackPageView } from "@/analytics/server"
import { ContentBody } from "@/components/ContentBody"
import { ContentImage } from "@/components/ContentImage"
import { PageContainer } from "@/components/PageContainer"
import { getPostSlugByPreviousSlug, getPublishedPostBySlug } from "@/db/content"
import { blockTreeToPlainText } from "@/lib/content"
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
    description:
      post.seoDescription ??
      post.excerpt ??
      (post.body ? blockTreeToPlainText(post.body) : null),
    path: `/blog/${post.slug}`,
    title: post.seoTitle ?? post.title
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    const currentSlug = await getPostSlugByPreviousSlug(slug)
    if (currentSlug) {
      permanentRedirect(`/blog/${currentSlug}`)
    }
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
        <ContentBody body={post.body} markdown={post.bodyMarkdown} />
      </div>
    </PageContainer>
  )
}
