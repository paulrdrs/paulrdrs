import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { ContentBody } from "@/components/ContentBody"
import { ContentImage } from "@/components/ContentImage"
import { PageContainer } from "@/components/PageContainer"
import { getPostSlugByPreviousSlug, getPublishedPostBySlug } from "@/db/content"
import { blockTreeToPlainText } from "@/lib/content"
import { buildContentMetadata } from "@/lib/metadata"

export const revalidate = 300

// Empty params so nothing prerenders at build (D1 is unavailable there); pages
// render on the first request and are then cached (ISR), revalidating every
// `revalidate` seconds.
export function generateStaticParams() {
  return []
}

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

  return (
    <PageContainer>
      <header className="pb-2">
        <div className="flex flex-col gap-4 lg:w-5/6">
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
          id={post.coverMediaId}
          presentation="wide"
          priority
        />
      ) : null}
      <div>
        <ContentBody body={post.body} />
      </div>
    </PageContainer>
  )
}
