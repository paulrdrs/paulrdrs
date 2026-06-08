import { desc, eq } from "drizzle-orm"
import type {
  PageFormValues,
  PostFormValues,
  ProjectFormValues
} from "@/cms/contentForms"
import type { PageKey } from "@/cms/pages"
import { getDb } from "./client"
import { pages, posts, projects } from "./schema"

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

export const getDashboardPages = async () => {
  return getDb()
    .select({
      createdAt: pages.createdAt,
      id: pages.id,
      key: pages.key,
      publishedAt: pages.publishedAt,
      status: pages.status,
      title: pages.title,
      updatedAt: pages.updatedAt
    })
    .from(pages)
    .orderBy(desc(pages.updatedAt), desc(pages.createdAt))
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
  values: PageFormValues
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
