import { desc, eq, like } from "drizzle-orm"
import type {
  PageFormValues,
  PostFormValues,
  ProjectFormValues
} from "@/cms/contentForms"
import type { PageKey } from "@/cms/pages"
import { getDb } from "./client"
import { mediaAssets, pages, posts, projects } from "./schema"

export type DashboardMediaAsset = typeof mediaAssets.$inferSelect

export const getDashboardPosts = async () => {
  return getDb()
    .select({
      createdAt: posts.createdAt,
      id: posts.id,
      publishedAt: posts.publishedAt,
      slug: posts.slug,
      status: posts.status,
      title: posts.title,
      updatedAt: posts.updatedAt
    })
    .from(posts)
    .orderBy(desc(posts.updatedAt), desc(posts.createdAt))
}

export const getDashboardPost = async (id: string) => {
  const [post] = await getDb()
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)

  return post
}

export const createDashboardPost = async (values: PostFormValues) => {
  const [post] = await getDb()
    .insert(posts)
    .values(values)
    .returning({ id: posts.id })

  return post
}

export const updateDashboardPost = async (
  id: string,
  values: PostFormValues
) => {
  const [post] = await getDb()
    .update(posts)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning({ id: posts.id })

  return post
}

export const getDashboardProjects = async () => {
  return getDb()
    .select({
      category: projects.category,
      createdAt: projects.createdAt,
      id: projects.id,
      publishedAt: projects.publishedAt,
      slug: projects.slug,
      status: projects.status,
      title: projects.title,
      updatedAt: projects.updatedAt
    })
    .from(projects)
    .orderBy(desc(projects.updatedAt), desc(projects.createdAt))
}

export const getDashboardProject = async (id: string) => {
  const [project] = await getDb()
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1)

  return project
}

export const createDashboardProject = async (values: ProjectFormValues) => {
  const [project] = await getDb()
    .insert(projects)
    .values(values)
    .returning({ id: projects.id })

  return project
}

export const updateDashboardProject = async (
  id: string,
  values: ProjectFormValues
) => {
  const [project] = await getDb()
    .update(projects)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning({ id: projects.id })

  return project
}

export const getDashboardPage = async (key: PageKey) => {
  const [page] = await getDb()
    .select()
    .from(pages)
    .where(eq(pages.key, key))
    .limit(1)

  return page
}

export const upsertDashboardPage = async (
  key: PageKey,
  values: PageFormValues & { metadata?: Record<string, unknown> }
) => {
  const [page] = await getDb()
    .insert(pages)
    .values({ ...values, key })
    .onConflictDoUpdate({
      set: { ...values, updatedAt: new Date() },
      target: pages.key
    })
    .returning({ key: pages.key })

  return page
}

export const getDashboardHeroOptions = async () => {
  const [publishedPosts, publishedProjects, media] = await Promise.all([
    getDb()
      .select({ id: posts.id, title: posts.title })
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt), desc(posts.createdAt)),
    getDb()
      .select({
        category: projects.category,
        id: projects.id,
        title: projects.title
      })
      .from(projects)
      .where(eq(projects.status, "published"))
      .orderBy(desc(projects.publishedAt), desc(projects.createdAt)),
    getDb()
      .select({
        altText: mediaAssets.altText,
        filename: mediaAssets.filename,
        id: mediaAssets.id
      })
      .from(mediaAssets)
      .where(like(mediaAssets.mimeType, "image/%"))
      .orderBy(desc(mediaAssets.createdAt))
  ])

  return {
    media,
    posts: publishedPosts,
    projects: publishedProjects
  }
}

export const getDashboardMediaAssets = async () => {
  return getDb()
    .select({
      altText: mediaAssets.altText,
      attribution: mediaAssets.attribution,
      createdAt: mediaAssets.createdAt,
      filename: mediaAssets.filename,
      height: mediaAssets.height,
      id: mediaAssets.id,
      mimeType: mediaAssets.mimeType,
      objectKey: mediaAssets.objectKey,
      sizeBytes: mediaAssets.sizeBytes,
      width: mediaAssets.width
    })
    .from(mediaAssets)
    .orderBy(desc(mediaAssets.createdAt))
}

export const getDashboardMediaAsset = async (
  id: string
): Promise<DashboardMediaAsset | undefined> => {
  const [asset] = await getDb()
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1)

  return asset
}

export const createDashboardMediaAsset = async ({
  altText,
  attribution,
  filename,
  mimeType,
  objectKey,
  sizeBytes
}: {
  altText: string | null
  attribution: string | null
  filename: string
  mimeType: string
  objectKey: string
  sizeBytes: number
}) => {
  const [asset] = await getDb()
    .insert(mediaAssets)
    .values({
      altText,
      attribution,
      filename,
      mimeType,
      objectKey,
      sizeBytes
    })
    .returning({ id: mediaAssets.id })

  return asset
}
