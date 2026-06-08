import { and, desc, eq } from "drizzle-orm"
import { getDb } from "./client"
import type { ProjectCategory } from "./contentTypes"
import { pages, posts, projects } from "./schema"

type PublishedPage = {
  bodyMarkdown: string
  id: string
  key: string
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

export const getPublishedPostBySlug = async (slug: string) => {
  const [post] = await getDb()
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      bodyMarkdown: posts.bodyMarkdown,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt
    })
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1)

  return post
}

export const getPublishedProjects = async (category?: ProjectCategory) => {
  return getDb()
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      category: projects.category,
      excerpt: projects.excerpt,
      publishedAt: projects.publishedAt,
      createdAt: projects.createdAt
    })
    .from(projects)
    .where(
      category
        ? and(eq(projects.status, "published"), eq(projects.category, category))
        : eq(projects.status, "published")
    )
    .orderBy(desc(projects.publishedAt), desc(projects.createdAt))
}

export const getPublishedProjectBySlug = async (
  category: ProjectCategory,
  slug: string
) => {
  const [project] = await getDb()
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      category: projects.category,
      excerpt: projects.excerpt,
      bodyMarkdown: projects.bodyMarkdown,
      links: projects.links,
      publishedAt: projects.publishedAt,
      createdAt: projects.createdAt
    })
    .from(projects)
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

export const getPublishedPageByKey = async (
  key: string
): Promise<PublishedPage | undefined> => {
  const [page] = await getDb()
    .select({
      bodyMarkdown: pages.bodyMarkdown,
      id: pages.id,
      key: pages.key,
      publishedAt: pages.publishedAt,
      title: pages.title
    })
    .from(pages)
    .where(and(eq(pages.key, key), eq(pages.status, "published")))
    .limit(1)

  return page
}
