import type { NotionBlockTree } from "@paulrdrs/content/blocks"
import type { ProjectCategory } from "@paulrdrs/content/content"
import {
  mediaAssets,
  pages,
  photoProjects,
  photos,
  posts,
  projects
} from "@paulrdrs/database/schema"
import { and, desc, eq, sql } from "drizzle-orm"
import { unstable_cache } from "next/cache"
import { cache } from "react"
import type { HomeFeaturedSelection } from "@/site/hero"
import { getDb } from "./client"

type PublishedPage = {
  body: NotionBlockTree | null
  id: string
  key: string
  metadata: Record<string, unknown> | null
  publishedAt: Date | null
  title: string
}

const contentCacheRevalidateSeconds = 300

const coverSelection = {
  coverAltText: mediaAssets.altText,
  coverAttribution: mediaAssets.attribution,
  coverMediaId: mediaAssets.id
}

const getPublishedPostsCached = unstable_cache(
  async () => {
    const rows = await getDb()
      .select({
        ...coverSelection,
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        publishedAt: posts.publishedAt,
        createdAt: posts.createdAt
      })
      .from(posts)
      .leftJoin(mediaAssets, eq(posts.coverMediaId, mediaAssets.id))
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt), desc(posts.createdAt))

    return rows.map(({ createdAt, publishedAt, ...post }) => ({
      ...post,
      createdAt: createdAt.getTime(),
      publishedAt: publishedAt?.getTime() ?? null
    }))
  },
  ["published-posts"],
  { revalidate: contentCacheRevalidateSeconds }
)

export const getPublishedPosts = async () => {
  const rows = await getPublishedPostsCached()

  return rows.map(({ createdAt, publishedAt, ...post }) => ({
    ...post,
    createdAt: new Date(createdAt),
    publishedAt: publishedAt === null ? null : new Date(publishedAt)
  }))
}

const getPublishedProjectsCached = unstable_cache(
  async (category?: ProjectCategory) => {
    const rows = await getDb()
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
          ? and(
              eq(projects.status, "published"),
              eq(projects.category, category)
            )
          : eq(projects.status, "published")
      )
      .orderBy(desc(projects.publishedAt), desc(projects.createdAt))

    return rows.map(({ createdAt, publishedAt, ...project }) => ({
      ...project,
      createdAt: createdAt.getTime(),
      publishedAt: publishedAt?.getTime() ?? null
    }))
  },
  ["published-projects"],
  { revalidate: contentCacheRevalidateSeconds }
)

export const getPublishedProjects = async (category?: ProjectCategory) => {
  const rows = await getPublishedProjectsCached(category)

  return rows.map(({ createdAt, publishedAt, ...project }) => ({
    ...project,
    createdAt: new Date(createdAt),
    publishedAt: publishedAt === null ? null : new Date(publishedAt)
  }))
}

const getPublishedPhotosCached = unstable_cache(
  async () => {
    const rows = await getDb()
      .select({
        ...coverSelection,
        id: photos.id,
        title: photos.title,
        slug: photos.slug,
        excerpt: photos.excerpt,
        publishedAt: photos.publishedAt,
        createdAt: photos.createdAt
      })
      .from(photos)
      .leftJoin(mediaAssets, eq(photos.mediaId, mediaAssets.id))
      .where(eq(photos.status, "published"))
      .orderBy(desc(photos.publishedAt), desc(photos.createdAt))

    return rows.map(({ createdAt, publishedAt, ...photo }) => ({
      ...photo,
      createdAt: createdAt.getTime(),
      publishedAt: publishedAt?.getTime() ?? null
    }))
  },
  ["published-photos"],
  { revalidate: contentCacheRevalidateSeconds }
)

export const getPublishedPhotos = async () => {
  const rows = await getPublishedPhotosCached()

  return rows.map(({ createdAt, publishedAt, ...photo }) => ({
    ...photo,
    createdAt: new Date(createdAt),
    publishedAt: publishedAt === null ? null : new Date(publishedAt)
  }))
}

/* Detail reads are request-deduplicated below and their routes use ISR. */
export const getPublishedPostBySlug = cache(async (slug: string) => {
  const rows = await getDb()
    .select({
      ...coverSelection,
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      body: posts.body,
      seoTitle: posts.seoTitle,
      seoDescription: posts.seoDescription,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt
    })
    .from(posts)
    .leftJoin(mediaAssets, eq(posts.coverMediaId, mediaAssets.id))
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1)

  return rows.at(0)
})

export const getPublishedProjectBySlug = cache(
  async (category: ProjectCategory, slug: string) => {
    const rows = await getDb()
      .select({
        ...coverSelection,
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        category: projects.category,
        excerpt: projects.excerpt,
        body: projects.body,
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

    return rows.at(0)
  }
)

// Slug redirects: find a published row whose `slugHistory` contains a now-stale
// slug, so the route can 301 to its current slug. `slugHistory` is a JSON array
// of strings; SQLite's `json_each` expands it so we can test membership.
export const getPostSlugByPreviousSlug = cache(async (slug: string) => {
  const rows = await getDb()
    .select({ slug: posts.slug })
    .from(posts)
    .where(
      and(
        eq(posts.status, "published"),
        sql`exists (select 1 from json_each(${posts.slugHistory}) where value = ${slug})`
      )
    )
    .limit(1)

  return rows.at(0)?.slug
})

export const getProjectSlugByPreviousSlug = cache(
  async (category: ProjectCategory, slug: string) => {
    const rows = await getDb()
      .select({ slug: projects.slug })
      .from(projects)
      .where(
        and(
          eq(projects.category, category),
          eq(projects.status, "published"),
          sql`exists (select 1 from json_each(${projects.slugHistory}) where value = ${slug})`
        )
      )
      .limit(1)

    return rows.at(0)?.slug
  }
)

export const getPublishedPhotoBySlug = cache(async (slug: string) => {
  const rows = await getDb()
    .select({
      ...coverSelection,
      id: photos.id,
      title: photos.title,
      slug: photos.slug,
      excerpt: photos.excerpt,
      body: photos.body,
      publishedAt: photos.publishedAt,
      createdAt: photos.createdAt
    })
    .from(photos)
    .leftJoin(mediaAssets, eq(photos.mediaId, mediaAssets.id))
    .where(and(eq(photos.slug, slug), eq(photos.status, "published")))
    .limit(1)

  return rows.at(0)
})

// The published photography projects a photo appears in (for detail-page
// backlinks).
export const getPhotoProjects = cache(async (photoId: string) => {
  return getDb()
    .select({
      category: projects.category,
      slug: projects.slug,
      title: projects.title
    })
    .from(photoProjects)
    .innerJoin(projects, eq(photoProjects.projectId, projects.id))
    .where(
      and(eq(photoProjects.photoId, photoId), eq(projects.status, "published"))
    )
    .orderBy(projects.title)
})

// The published photos that appear in a given project (for its project page).
export const getPublishedProjectPhotos = cache(async (projectId: string) => {
  return getDb()
    .select({
      ...coverSelection,
      id: photos.id,
      title: photos.title,
      slug: photos.slug,
      excerpt: photos.excerpt
    })
    .from(photoProjects)
    .innerJoin(photos, eq(photoProjects.photoId, photos.id))
    .leftJoin(mediaAssets, eq(photos.mediaId, mediaAssets.id))
    .where(
      and(
        eq(photoProjects.projectId, projectId),
        eq(photos.status, "published")
      )
    )
    .orderBy(desc(photos.publishedAt), desc(photos.createdAt))
})

export const getPhotoSlugByPreviousSlug = cache(async (slug: string) => {
  const rows = await getDb()
    .select({ slug: photos.slug })
    .from(photos)
    .where(
      and(
        eq(photos.status, "published"),
        sql`exists (select 1 from json_each(${photos.slugHistory}) where value = ${slug})`
      )
    )
    .limit(1)

  return rows.at(0)?.slug
})

const getPublishedPageByKeyCached = unstable_cache(
  async (key: string) => {
    const [page] = await getDb()
      .select({
        body: pages.body,
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
      ? { ...page, publishedAt: page.publishedAt?.getTime() ?? null }
      : undefined
  },
  ["published-page-by-key"],
  { revalidate: contentCacheRevalidateSeconds }
)

export const getPublishedPageByKey = cache(
  async (key: string): Promise<PublishedPage | undefined> => {
    const page = await getPublishedPageByKeyCached(key)

    return page
      ? {
          ...page,
          publishedAt:
            page.publishedAt === null ? null : new Date(page.publishedAt)
        }
      : undefined
  }
)

export const getFeaturedHomeContentItem = unstable_cache(
  async (selection: HomeFeaturedSelection) => {
    if (selection.kind === "post") {
      const [post] = await getDb()
        .select({
          ...coverSelection,
          excerpt: posts.excerpt,
          id: posts.id,
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
  },
  ["featured-home-content-item"],
  { revalidate: contentCacheRevalidateSeconds }
)

export type FeaturedHomeContentItem = NonNullable<
  Awaited<ReturnType<typeof getFeaturedHomeContentItem>>
>
