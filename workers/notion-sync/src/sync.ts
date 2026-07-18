import { collectPaginatedAPI, isFullPage } from "@notionhq/client"
import type { ImageBlock, NotionBlockTree } from "@paulrdrs/content/blocks"
import {
  pages,
  photoProjects,
  photos,
  posts,
  projects
} from "@paulrdrs/database/schema"
import {
  type AnyColumn,
  and,
  eq,
  inArray,
  isNotNull,
  isNull,
  ne,
  or,
  sql
} from "drizzle-orm"
import { fetchPageBlocks } from "./blocks"
import {
  type MappedContent,
  type MappedPage,
  type MappedPhoto,
  type MappedPost,
  type MappedProject,
  mapPagePage,
  mapPhotoPage,
  mapPostPage,
  mapProjectPage,
  type NotionPage
} from "./mapping"
import { getNotionImageSourceKey, rehostImage } from "./media"
import type { NotionSyncRuntime } from "./runtime"

export type NotionSyncTypeSummary = {
  readonly errors: readonly string[]
  readonly synced: number
}

export type NotionSyncSummary = {
  readonly pages: NotionSyncTypeSummary
  readonly photos: NotionSyncTypeSummary
  readonly posts: NotionSyncTypeSummary
  readonly projects: NotionSyncTypeSummary
}

const queryDatabasePages = async (
  runtime: NotionSyncRuntime,
  databaseId: string
): Promise<NotionPage[]> => {
  const database = await runtime.notion.databases.retrieve({
    database_id: databaseId
  })

  const [dataSource] = "data_sources" in database ? database.data_sources : []

  if (!dataSource) {
    throw new Error(`Notion database ${databaseId} has no data source`)
  }

  const results = await collectPaginatedAPI(runtime.notion.dataSources.query, {
    data_source_id: dataSource.id
  })

  return results
    .filter(isFullPage)
    .map((page) => ({ id: page.id, properties: page.properties }))
}

type SlugState = {
  readonly slug: string
  readonly slugHistory: readonly string[]
}

// Preserve every previous slug so content renamed while draft still redirects
// correctly if it was published before being unpublished.
const resolveSlug = (
  existing: SlugState | undefined,
  mappedSlug: string
): { slug: string; slugHistory: string[] } => {
  if (!existing || existing.slug === mappedSlug) {
    return { slug: mappedSlug, slugHistory: [...(existing?.slugHistory ?? [])] }
  }

  const slugHistory = [
    ...new Set([...existing.slugHistory, existing.slug])
  ].filter((slug) => slug !== mappedSlug)

  return { slug: mappedSlug, slugHistory }
}

const rehostCover = async (
  runtime: NotionSyncRuntime,
  mapped: MappedContent
) =>
  mapped.coverImage
    ? rehostImage(
        runtime,
        mapped.coverImage.url,
        getNotionImageSourceKey(mapped.coverImage)
      )
    : null

const upsertPost = async (
  runtime: NotionSyncRuntime,
  mapped: MappedPost,
  body: NotionBlockTree
) => {
  const { db } = runtime

  const [existing] = await db
    .select({
      slug: posts.slug,
      slugHistory: posts.slugHistory
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

  const coverMediaId = await rehostCover(runtime, mapped)

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

const upsertProject = async (
  runtime: NotionSyncRuntime,
  mapped: MappedProject,
  body: NotionBlockTree
) => {
  const { db } = runtime

  const [existing] = await db
    .select({
      slug: projects.slug,
      slugHistory: projects.slugHistory
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

  const coverMediaId = await rehostCover(runtime, mapped)

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

const upsertPage = async (
  runtime: NotionSyncRuntime,
  mapped: MappedPage,
  body: NotionBlockTree
) => {
  const { db } = runtime

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

const findFirstImageBlock = (blocks: NotionBlockTree): ImageBlock | null => {
  for (const block of blocks) {
    if (block.type === "image") {
      return block
    }

    const nested = findFirstImageBlock(block.children)

    if (nested) {
      return nested
    }
  }

  return null
}

const removeBlock = (blocks: NotionBlockTree, id: string): NotionBlockTree =>
  blocks
    .filter((block) => block.id !== id)
    .map((block) => ({ ...block, children: removeBlock(block.children, id) }))

// The photograph itself is the first image block of a Photos page body (blocks
// arrive already re-hosted, carrying a mediaId); the rest of the body is the
// photo's story text.
export const extractPrimaryPhoto = (
  body: NotionBlockTree
): { readonly body: NotionBlockTree; readonly mediaId: string } => {
  const image = findFirstImageBlock(body)

  if (!image) {
    throw new Error("Photo page has no image block")
  }

  return { body: removeBlock(body, image.id), mediaId: image.mediaId }
}

// Links are rebuilt wholesale from the Notion "Projects" relation on every
// sync; relation targets not yet synced (or unpublished) are silently dropped
// and heal on the next run.
const rebuildPhotoProjectLinks = async (
  runtime: NotionSyncRuntime,
  photoId: string,
  projectNotionPageIds: readonly string[]
) => {
  const { db } = runtime

  const linkedProjects =
    projectNotionPageIds.length > 0
      ? await db
          .select({ id: projects.id })
          .from(projects)
          .where(inArray(projects.notionPageId, [...projectNotionPageIds]))
          .limit(projectNotionPageIds.length)
      : []

  const deleteLinks = db
    .delete(photoProjects)
    .where(eq(photoProjects.photoId, photoId))

  if (linkedProjects.length === 0) {
    await deleteLinks
    return
  }

  const insertLinks = db
    .insert(photoProjects)
    .values(linkedProjects.map(({ id }) => ({ photoId, projectId: id })))

  await db.batch([deleteLinks, insertLinks])
}

const upsertPhoto = async (
  runtime: NotionSyncRuntime,
  mapped: MappedPhoto,
  rawBody: NotionBlockTree
) => {
  const { db } = runtime

  const [existing] = await db
    .select({
      slug: photos.slug,
      slugHistory: photos.slugHistory
    })
    .from(photos)
    .where(eq(photos.notionPageId, mapped.notionPageId))
    .limit(1)

  const { slug, slugHistory } = resolveSlug(existing, mapped.slug)

  const [collision] = await db
    .select({ id: photos.id })
    .from(photos)
    .where(
      and(
        eq(photos.slug, slug),
        or(
          isNull(photos.notionPageId),
          ne(photos.notionPageId, mapped.notionPageId)
        )
      )
    )
    .limit(1)

  if (collision) {
    throw new Error(`Slug "${slug}" is already used by another photo`)
  }

  const { body, mediaId } = extractPrimaryPhoto(rawBody)

  const values = {
    body,
    excerpt: mapped.excerpt,
    mediaId,
    notionPageId: mapped.notionPageId,
    publishedAt: mapped.publishedAt,
    slug,
    slugHistory,
    status: mapped.status,
    title: mapped.title
  }

  const [row] = await db
    .insert(photos)
    .values(values)
    .onConflictDoUpdate({
      set: { ...values, updatedAt: new Date() },
      target: photos.notionPageId
    })
    .returning({ id: photos.id })

  if (row) {
    await rebuildPhotoProjectLinks(runtime, row.id, mapped.projectNotionPageIds)
  }
}

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

const syncPreparationBatchSize = 3

type PreparedSyncEntry = {
  readonly persist: () => Promise<void>
}

type FailedSyncEntry = {
  readonly error: string
}

const isFailedSyncEntry = (
  entry: PreparedSyncEntry | FailedSyncEntry
): entry is FailedSyncEntry => "error" in entry

// Reconcile only after a complete Notion query. IDs are taken from the source
// result, not the successful-entry count, so one malformed entry is preserved
// for a later retry instead of being mistaken for a deletion.
const missingNotionPageCondition = (
  notionPageIds: readonly string[],
  notionPageIdColumn: AnyColumn<{ data: string }>
) =>
  notionPageIds.length > 0
    ? sql`${notionPageIdColumn} not in (select value from json_each(${JSON.stringify(notionPageIds)}))`
    : undefined

const markMissingPostsAsDraft = async (
  runtime: NotionSyncRuntime,
  notionPageIds: readonly string[]
) => {
  await runtime.db
    .update(posts)
    .set({ status: "draft", updatedAt: new Date() })
    .where(
      and(
        eq(posts.status, "published"),
        isNotNull(posts.notionPageId),
        missingNotionPageCondition(notionPageIds, posts.notionPageId)
      )
    )
}

const markMissingProjectsAsDraft = async (
  runtime: NotionSyncRuntime,
  notionPageIds: readonly string[]
) => {
  await runtime.db
    .update(projects)
    .set({ status: "draft", updatedAt: new Date() })
    .where(
      and(
        eq(projects.status, "published"),
        isNotNull(projects.notionPageId),
        missingNotionPageCondition(notionPageIds, projects.notionPageId)
      )
    )
}

const markMissingPagesAsDraft = async (
  runtime: NotionSyncRuntime,
  notionPageIds: readonly string[]
) => {
  await runtime.db
    .update(pages)
    .set({ status: "draft", updatedAt: new Date() })
    .where(
      and(
        eq(pages.status, "published"),
        isNotNull(pages.notionPageId),
        missingNotionPageCondition(notionPageIds, pages.notionPageId)
      )
    )
}

const markMissingPhotosAsDraft = async (
  runtime: NotionSyncRuntime,
  notionPageIds: readonly string[]
) => {
  await runtime.db
    .update(photos)
    .set({ status: "draft", updatedAt: new Date() })
    .where(
      and(
        eq(photos.status, "published"),
        isNotNull(photos.notionPageId),
        missingNotionPageCondition(notionPageIds, photos.notionPageId)
      )
    )
}

const syncEntries = async (
  runtime: NotionSyncRuntime,
  databaseId: string,
  preparePage: (page: NotionPage) => Promise<PreparedSyncEntry>,
  markMissingAsDraft: (notionPageIds: readonly string[]) => Promise<void>
): Promise<NotionSyncTypeSummary> => {
  const notionPages = await queryDatabasePages(runtime, databaseId)
  const errors: string[] = []
  let synced = 0

  for (
    let batchStart = 0;
    batchStart < notionPages.length;
    batchStart += syncPreparationBatchSize
  ) {
    const batch = notionPages.slice(
      batchStart,
      batchStart + syncPreparationBatchSize
    )
    const preparedEntries = await Promise.all(
      batch.map(async (page): Promise<PreparedSyncEntry | FailedSyncEntry> => {
        try {
          return await preparePage(page)
        } catch (error) {
          return { error: toErrorMessage(error) }
        }
      })
    )

    // Writes remain ordered so slug collisions and duplicate page keys retain
    // the same deterministic behavior as the original sequential sync.
    for (const entry of preparedEntries) {
      if (isFailedSyncEntry(entry)) {
        errors.push(entry.error)
        continue
      }

      try {
        await entry.persist()
        synced += 1
      } catch (error) {
        errors.push(toErrorMessage(error))
      }
    }
  }

  await markMissingAsDraft(notionPages.map((page) => page.id))

  return { errors, synced }
}

export const createNotionSync = (runtime: NotionSyncRuntime) => {
  const syncPosts = () =>
    syncEntries(
      runtime,
      runtime.databaseIds.posts,
      async (page) => {
        const mapped = mapPostPage(page)
        const body = await fetchPageBlocks(runtime, page.id)
        return { persist: () => upsertPost(runtime, mapped, body) }
      },
      (notionPageIds) => markMissingPostsAsDraft(runtime, notionPageIds)
    )

  const syncProjects = () =>
    syncEntries(
      runtime,
      runtime.databaseIds.projects,
      async (page) => {
        const mapped = mapProjectPage(page)
        const body = await fetchPageBlocks(runtime, page.id)
        return { persist: () => upsertProject(runtime, mapped, body) }
      },
      (notionPageIds) => markMissingProjectsAsDraft(runtime, notionPageIds)
    )

  const syncPages = () =>
    syncEntries(
      runtime,
      runtime.databaseIds.pages,
      async (page) => {
        const mapped = mapPagePage(page)
        const body = await fetchPageBlocks(runtime, page.id)
        return { persist: () => upsertPage(runtime, mapped, body) }
      },
      (notionPageIds) => markMissingPagesAsDraft(runtime, notionPageIds)
    )

  const syncPhotos = () =>
    syncEntries(
      runtime,
      runtime.databaseIds.photos,
      async (page) => {
        const mapped = mapPhotoPage(page)
        const body = await fetchPageBlocks(runtime, page.id)
        return { persist: () => upsertPhoto(runtime, mapped, body) }
      },
      (notionPageIds) => markMissingPhotosAsDraft(runtime, notionPageIds)
    )

  return { syncPages, syncPhotos, syncPosts, syncProjects }
}
