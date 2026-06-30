import "server-only"
import { collectPaginatedAPI, isFullPage } from "@notionhq/client"
import { and, eq, isNull, ne, or } from "drizzle-orm"
import { getDb } from "@/db/client"
import type { ContentStatus } from "@/db/contentTypes"
import { pages, posts, projects } from "@/db/schema"
import { getNotionEnvs } from "@/envs/server"
import { fetchPageBlocks } from "./blocks"
import { getNotionClient } from "./client"
import {
  type MappedContent,
  type MappedPage,
  type MappedPost,
  type MappedProject,
  mapPagePage,
  mapPostPage,
  mapProjectPage,
  type NotionPage
} from "./mapping"
import { getNotionImageSourceKey, rehostImage } from "./media"
import type { NotionBlockTree } from "./types"

export type NotionSyncTypeSummary = {
  readonly errors: readonly string[]
  readonly synced: number
}

export type NotionSyncSummary = {
  readonly pages: NotionSyncTypeSummary
  readonly posts: NotionSyncTypeSummary
  readonly projects: NotionSyncTypeSummary
}

const queryDatabasePages = async (
  databaseId: string
): Promise<NotionPage[]> => {
  const client = getNotionClient()
  const database = await client.databases.retrieve({ database_id: databaseId })

  const [dataSource] = "data_sources" in database ? database.data_sources : []

  if (!dataSource) {
    throw new Error(`Notion database ${databaseId} has no data source`)
  }

  const results = await collectPaginatedAPI(client.dataSources.query, {
    data_source_id: dataSource.id
  })

  return results
    .filter(isFullPage)
    .map((page) => ({ id: page.id, properties: page.properties }))
}

type SlugState = {
  readonly slug: string
  readonly slugHistory: readonly string[]
  readonly status: ContentStatus
}

// Published rows keep their slug unless Notion shows a real rename; the old
// slug then moves into history (deduped, never the new current slug) so the
// public route can 301 it. Draft/unpublished/new rows just take the mapped
// slug — nothing has been public yet, so there's no URL to preserve.
const resolveSlug = (
  existing: SlugState | undefined,
  mappedSlug: string
): { slug: string; slugHistory: string[] } => {
  if (existing?.status !== "published" || existing.slug === mappedSlug) {
    return { slug: mappedSlug, slugHistory: [...(existing?.slugHistory ?? [])] }
  }

  const slugHistory = [
    ...new Set([...existing.slugHistory, existing.slug])
  ].filter((slug) => slug !== mappedSlug)

  return { slug: mappedSlug, slugHistory }
}

const rehostCover = async (mapped: MappedContent) =>
  mapped.coverImage
    ? rehostImage(
        mapped.coverImage.url,
        getNotionImageSourceKey(mapped.coverImage)
      )
    : null

const upsertPost = async (mapped: MappedPost, body: NotionBlockTree) => {
  const db = getDb()

  const [existing] = await db
    .select({
      slug: posts.slug,
      slugHistory: posts.slugHistory,
      status: posts.status
    })
    .from(posts)
    .where(eq(posts.notionPageId, mapped.notionPageId))
    .limit(1)

  const { slug, slugHistory } = resolveSlug(existing, mapped.slug)

  const [collision] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(
      and(
        eq(posts.slug, slug),
        or(
          isNull(posts.notionPageId),
          ne(posts.notionPageId, mapped.notionPageId)
        )
      )
    )
    .limit(1)

  if (collision) {
    throw new Error(`Slug "${slug}" is already used by another post`)
  }

  const coverMediaId = await rehostCover(mapped)

  const values = {
    body,
    coverMediaId,
    excerpt: mapped.excerpt,
    notionPageId: mapped.notionPageId,
    publishedAt: mapped.publishedAt,
    seoDescription: mapped.seoDescription,
    seoTitle: mapped.seoTitle,
    slug,
    slugHistory,
    status: mapped.status,
    tags: mapped.tags,
    title: mapped.title
  }

  await db
    .insert(posts)
    .values(values)
    .onConflictDoUpdate({
      set: { ...values, updatedAt: new Date() },
      target: posts.notionPageId
    })
}

const upsertProject = async (mapped: MappedProject, body: NotionBlockTree) => {
  const db = getDb()

  const [existing] = await db
    .select({
      slug: projects.slug,
      slugHistory: projects.slugHistory,
      status: projects.status
    })
    .from(projects)
    .where(eq(projects.notionPageId, mapped.notionPageId))
    .limit(1)

  const { slug, slugHistory } = resolveSlug(existing, mapped.slug)

  const [collision] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.category, mapped.category),
        eq(projects.slug, slug),
        or(
          isNull(projects.notionPageId),
          ne(projects.notionPageId, mapped.notionPageId)
        )
      )
    )
    .limit(1)

  if (collision) {
    throw new Error(
      `Slug "${slug}" is already used by another ${mapped.category} project`
    )
  }

  const coverMediaId = await rehostCover(mapped)

  const values = {
    body,
    category: mapped.category,
    coverMediaId,
    excerpt: mapped.excerpt,
    notionPageId: mapped.notionPageId,
    publishedAt: mapped.publishedAt,
    seoDescription: mapped.seoDescription,
    seoTitle: mapped.seoTitle,
    slug,
    slugHistory,
    status: mapped.status,
    title: mapped.title
  }

  await db
    .insert(projects)
    .values(values)
    .onConflictDoUpdate({
      set: { ...values, updatedAt: new Date() },
      target: projects.notionPageId
    })
}

const upsertPage = async (mapped: MappedPage, body: NotionBlockTree) => {
  const db = getDb()

  const values = {
    body,
    key: mapped.key,
    notionPageId: mapped.notionPageId,
    publishedAt: mapped.publishedAt,
    status: mapped.status,
    title: mapped.title
  }

  await db
    .insert(pages)
    .values(values)
    .onConflictDoUpdate({
      set: { ...values, updatedAt: new Date() },
      target: pages.key
    })
}

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

const syncEntries = async (
  databaseId: string,
  syncPage: (page: NotionPage) => Promise<void>
): Promise<NotionSyncTypeSummary> => {
  const notionPages = await queryDatabasePages(databaseId)
  const errors: string[] = []
  let synced = 0

  for (const page of notionPages) {
    try {
      await syncPage(page)
      synced += 1
    } catch (error) {
      errors.push(toErrorMessage(error))
    }
  }

  return { errors, synced }
}

export const syncPosts = (databaseId: string) =>
  syncEntries(databaseId, async (page) => {
    const mapped = mapPostPage(page)
    const body = await fetchPageBlocks(page.id)
    await upsertPost(mapped, body)
  })

export const syncProjects = (databaseId: string) =>
  syncEntries(databaseId, async (page) => {
    const mapped = mapProjectPage(page)
    const body = await fetchPageBlocks(page.id)
    await upsertProject(mapped, body)
  })

export const syncPages = (databaseId: string) =>
  syncEntries(databaseId, async (page) => {
    const mapped = mapPagePage(page)
    const body = await fetchPageBlocks(page.id)
    await upsertPage(mapped, body)
  })

export const runNotionSync = async (): Promise<NotionSyncSummary> => {
  const envs = getNotionEnvs()

  const postsSummary = await syncPosts(envs.NOTION_POSTS_DB_ID)
  const projectsSummary = await syncProjects(envs.NOTION_PROJECTS_DB_ID)
  const pagesSummary = await syncPages(envs.NOTION_PAGES_DB_ID)

  return { pages: pagesSummary, posts: postsSummary, projects: projectsSummary }
}
