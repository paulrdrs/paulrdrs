import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { ContentBody } from "@/components/ContentBody"
import { ContentImage } from "@/components/ContentImage"
import { Eyebrow } from "@/components/Eyebrow"
import { PageContainer } from "@/components/PageContainer"
import { getPostSlugByPreviousSlug, getPublishedPostBySlug } from "@/db/content"
import { blockTreeToPlainText } from "@/lib/content"
import { buildContentMetadata } from "@/lib/metadata"

export const revalidate = 300

// Empty params so nothing prerenders at build; pages
// render on the first request and are then cached (ISR), revalidating every
// `revalidate` seconds.
export function generateStaticParams() {
  return []
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)

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

  const displayDate = post.publishedAt ?? post.createdAt

  return (
    <PageContainer>
      <header className="flex flex-col gap-2 p-4">
        <div className="flex flex-col gap-1">
          <time dateTime={displayDate.toISOString()}>
            <Eyebrow label={formatDate(displayDate)} />
          </time>
          <h1 className="text-balance font-bold text-4xl">{post.title}</h1>
          {post.tags.length > 0 ? (
            <nav aria-label="Post tags" className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <Link
                  className="rounded-sm border border-limit bg-canvas px-2 font-medium font-mono text-muted text-xs uppercase tracking-widest"
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  key={tag}
                >
                  {tag}
                </Link>
              ))}
            </nav>
          ) : null}
          {post.excerpt ? (
            <p className="text-lg text-muted leading-6">{post.excerpt}</p>
          ) : null}
        </div>

        {post.coverMediaId ? (
          <ContentImage
            alt={post.coverAltText}
            attribution={post.coverAttribution}
            id={post.coverMediaId}
            presentation="wide"
            priority
          />
        ) : null}
      </header>
      <div className="px-4">
        <ContentBody body={post.body} />
      </div>
    </PageContainer>
  )
}
