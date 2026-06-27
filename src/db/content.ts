import { and, desc, eq } from "drizzle-orm"
import { cache } from "react"
import type { HeroSelection } from "@/site/hero"
import { getDb } from "./client"
import type { ProjectCategory } from "./contentTypes"
import { mediaAssets, pages, posts, projects } from "./schema"

type PublishedPage = {
  bodyMarkdown: string
  id: string
  key: string
  metadata: Record<string, unknown> | null
  publishedAt: Date | null
  title: string
}

export const getPublishedPosts = async () => {
  return getDb()
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt
    })
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
}

export const getPublishedPostBySlug = cache(async (slug: string) => {
  const [post] = await getDb()
    .select({
      ...coverSelection,
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      bodyMarkdown: posts.bodyMarkdown,
      seoTitle: posts.seoTitle,
      seoDescription: posts.seoDescription,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt
    })
    .from(posts)
    .leftJoin(mediaAssets, eq(posts.coverMediaId, mediaAssets.id))
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1)

  return post
})

export const getPublishedProjects = async (category?: ProjectCategory) => {
  return getDb()
    .select({
      ...coverSelection,
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      category: projects.category,
      excerpt: projects.excerpt,
      publishedAt: projects.publishedAt,
      createdAt: projects.createdAt
    })
    .from(projects)
    .leftJoin(mediaAssets, eq(projects.coverMediaId, mediaAssets.id))
    .where(
      category
        ? and(eq(projects.status, "published"), eq(projects.category, category))
        : eq(projects.status, "published")
    )
    .orderBy(desc(projects.publishedAt), desc(projects.createdAt))
}

export const getPublishedProjectBySlug = cache(
  async (category: ProjectCategory, slug: string) => {
    const [project] = await getDb()
      .select({
        ...coverSelection,
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        category: projects.category,
        excerpt: projects.excerpt,
        bodyMarkdown: projects.bodyMarkdown,
        links: projects.links,
        seoTitle: projects.seoTitle,
        seoDescription: projects.seoDescription,
        publishedAt: projects.publishedAt,
        createdAt: projects.createdAt
      })
      .from(projects)
      .leftJoin(mediaAssets, eq(projects.coverMediaId, mediaAssets.id))
      .where(
        and(
          eq(projects.slug, slug),
          eq(projects.category, category),
          eq(projects.status, "published")
        )
      )
      .limit(1)

    return project
  }
)

export const getPublishedPageByKey = cache(
  async (key: string): Promise<PublishedPage | undefined> => {
    const [page] = await getDb()
      .select({
        bodyMarkdown: pages.bodyMarkdown,
        id: pages.id,
        key: pages.key,
        metadata: pages.metadata,
        publishedAt: pages.publishedAt,
        title: pages.title
      })
      .from(pages)
      .where(and(eq(pages.key, key), eq(pages.status, "published")))
      .limit(1)

    return page
  }
)

const coverSelection = {
  coverAltText: mediaAssets.altText,
  coverAttribution: mediaAssets.attribution,
  coverHeight: mediaAssets.height,
  coverMediaId: mediaAssets.id,
  coverWidth: mediaAssets.width
}

export const getFeaturedHeroContent = async (selection: HeroSelection) => {
  if (selection.kind === "post") {
    const [post] = await getDb()
      .select({
        ...coverSelection,
        excerpt: posts.excerpt,
        id: posts.id,
        publishedAt: posts.publishedAt,
        slug: posts.slug,
        title: posts.title
      })
      .from(posts)
      .leftJoin(mediaAssets, eq(posts.coverMediaId, mediaAssets.id))
      .where(and(eq(posts.id, selection.id), eq(posts.status, "published")))
      .limit(1)

    return post
      ? {
          ...post,
          href: `/blog/${post.slug}`,
          kind: "post" as const,
          label: "From the blog"
        }
      : undefined
  }

  if (selection.kind === "project") {
    const [project] = await getDb()
      .select({
        ...coverSelection,
        category: projects.category,
        excerpt: projects.excerpt,
        id: projects.id,
        publishedAt: projects.publishedAt,
        slug: projects.slug,
        title: projects.title
      })
      .from(projects)
      .leftJoin(mediaAssets, eq(projects.coverMediaId, mediaAssets.id))
      .where(
        and(eq(projects.id, selection.id), eq(projects.status, "published"))
      )
      .limit(1)

    return project
      ? {
          ...project,
          href: `/projects/${project.category}/${project.slug}`,
          kind: "project" as const,
          label: project.category
        }
      : undefined
  }

  const [media] = await getDb()
    .select({
      altText: mediaAssets.altText,
      attribution: mediaAssets.attribution,
      filename: mediaAssets.filename,
      height: mediaAssets.height,
      id: mediaAssets.id,
      mimeType: mediaAssets.mimeType,
      width: mediaAssets.width
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, selection.id))
    .limit(1)

  if (!media?.mimeType.startsWith("image/")) {
    return undefined
  }

  return {
    coverAltText: media.altText,
    coverAttribution: media.attribution,
    coverHeight: media.height,
    coverMediaId: media.id,
    coverWidth: media.width,
    excerpt: media.attribution,
    href: `/photo/${media.id}`,
    id: media.id,
    kind: "media" as const,
    label: "Photograph",
    publishedAt: null,
    title: media.altText || media.filename
  }
}

export type FeaturedHero = NonNullable<
  Awaited<ReturnType<typeof getFeaturedHeroContent>>
>

export const getPublicMediaAsset = cache(async (id: string) => {
  const [media] = await getDb()
    .select({
      altText: mediaAssets.altText,
      attribution: mediaAssets.attribution,
      filename: mediaAssets.filename,
      height: mediaAssets.height,
      id: mediaAssets.id,
      mimeType: mediaAssets.mimeType,
      width: mediaAssets.width
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1)

  return media?.mimeType.startsWith("image/") ? media : undefined
})
