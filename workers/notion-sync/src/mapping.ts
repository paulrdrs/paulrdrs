import type { ContentStatus, ProjectCategory } from "@paulrdrs/content/content"
import { isPageKey, type PageKey } from "@paulrdrs/content/pages"
import { z } from "zod"

const createSlug = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export type NotionPage = {
  readonly id: string
  readonly properties: Record<string, unknown>
}

export type MappedContent = {
  readonly excerpt: string | null
  readonly notionPageId: string
  readonly publishedAt: Date | null
  readonly seoDescription: string | null
  readonly seoTitle: string | null
  readonly slug: string
  readonly status: ContentStatus
  readonly title: string
}

export type MappedPost = MappedContent & {
  readonly tags: string[]
}

export type MappedProject = MappedContent & {
  readonly category: ProjectCategory
}

export type MappedPage = {
  readonly key: PageKey
  readonly notionPageId: string
  readonly publishedAt: Date | null
  readonly status: ContentStatus
  readonly title: string
}

export type MappedPhoto = {
  readonly excerpt: string | null
  readonly notionPageId: string
  readonly photographyProjectNotionPageIds: readonly string[]
  readonly publishedAt: Date | null
  readonly slug: string
  readonly status: ContentStatus
  readonly title: string
}

const richTextArraySchema = z
  .array(z.object({ plain_text: z.string() }))
  .transform((items) => items.map((item) => item.plain_text).join(""))

const titlePropertySchema = z.object({ title: richTextArraySchema })
const textPropertySchema = z.object({ rich_text: richTextArraySchema })

const statusPropertySchema = z.object({
  status: z.object({ name: z.enum(["Draft", "Published"]) })
})

const selectPropertySchema = z.object({
  select: z.object({ name: z.string() }).nullable()
})

const multiSelectPropertySchema = z.object({
  multi_select: z.array(z.object({ name: z.string() }))
})

const datePropertySchema = z.object({
  date: z.object({ start: z.string() }).nullable()
})

const relationPropertySchema = z.object({
  relation: z.array(z.object({ id: z.string() }))
})

const getRichText = (page: NotionPage, name: string) =>
  textPropertySchema.parse(page.properties[name]).rich_text.trim()

const getNullableRichText = (page: NotionPage, name: string) =>
  getRichText(page, name) || null

const getTitle = (page: NotionPage): string => {
  const title = titlePropertySchema.parse(page.properties.Title).title.trim()

  if (!title) {
    throw new Error("Title is required")
  }

  return title
}

const getSlug = (page: NotionPage, title: string): string => {
  const explicit = createSlug(getRichText(page, "Slug"))
  const slug = explicit || createSlug(title)

  if (!slug) {
    throw new Error("Could not derive a slug from the Slug or Title property")
  }

  return slug
}

const getStatus = (page: NotionPage): ContentStatus =>
  statusPropertySchema.parse(page.properties.Status).status.name === "Published"
    ? "published"
    : "draft"

const getPublishedAt = (page: NotionPage): Date | null => {
  const date = datePropertySchema.parse(page.properties.Published).date
  return date ? new Date(date.start) : null
}

const getTags = (page: NotionPage): string[] =>
  multiSelectPropertySchema
    .parse(page.properties.Tags)
    .multi_select.map((option) => option.name)

const getPhotographyProjectRelationIds = (page: NotionPage): string[] =>
  relationPropertySchema
    .parse(page.properties["Photography Projects"])
    .relation.map((item) => item.id)

const getKey = (page: NotionPage): PageKey => {
  const name = selectPropertySchema.parse(page.properties.Key).select?.name

  if (!name || !isPageKey(name)) {
    throw new Error(`Invalid page key: ${name ?? "(none)"}`)
  }

  return name
}

const withMalformedPageError = <T>(
  kind: string,
  page: NotionPage,
  map: () => T
): T => {
  try {
    return map()
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`Malformed Notion ${kind} page ${page.id}: ${reason}`)
  }
}

const mapContentProperties = (page: NotionPage): MappedContent => {
  const title = getTitle(page)

  return {
    excerpt: getNullableRichText(page, "Excerpt"),
    notionPageId: page.id,
    publishedAt: getPublishedAt(page),
    seoDescription: getNullableRichText(page, "SEO Description"),
    seoTitle: getNullableRichText(page, "SEO Title"),
    slug: getSlug(page, title),
    status: getStatus(page),
    title
  }
}

export const mapPostPage = (page: NotionPage): MappedPost =>
  withMalformedPageError("post", page, () => ({
    ...mapContentProperties(page),
    tags: getTags(page)
  }))

export const mapProjectPage = (
  page: NotionPage,
  category: ProjectCategory
): MappedProject =>
  withMalformedPageError("project", page, () => ({
    ...mapContentProperties(page),
    category
  }))

export const mapPagePage = (page: NotionPage): MappedPage =>
  withMalformedPageError("page", page, () => ({
    key: getKey(page),
    notionPageId: page.id,
    publishedAt: getPublishedAt(page),
    status: getStatus(page),
    title: getTitle(page)
  }))

export const mapPhotoPage = (page: NotionPage): MappedPhoto =>
  withMalformedPageError("photo", page, () => {
    const title = getTitle(page)

    return {
      excerpt: getNullableRichText(page, "Excerpt"),
      notionPageId: page.id,
      photographyProjectNotionPageIds: getPhotographyProjectRelationIds(page),
      publishedAt: getPublishedAt(page),
      slug: getSlug(page, title),
      status: getStatus(page),
      title
    }
  })
