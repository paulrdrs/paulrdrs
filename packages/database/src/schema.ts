import type { NotionBlockTree } from "@paulrdrs/content/blocks"
import {
  contentStatusValues,
  projectCategoryValues
} from "@paulrdrs/content/content"
import { sql } from "drizzle-orm"
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex
} from "drizzle-orm/sqlite-core"

// Fresh `created_at` / `updated_at` column builders for tables that track both.
// Stored as unix-epoch seconds; `updated_at` is bumped explicitly in app code.
const timestamps = () => ({
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
})

const primaryId = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())

export const mediaAssets = sqliteTable(
  "media_assets",
  {
    id: primaryId(),
    objectKey: text("object_key").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    altText: text("alt_text"),
    attribution: text("attribution"),
    metadata: text("metadata", { mode: "json" })
      .$type<Record<string, unknown>>()
      .default(sql`'{}'`),
    sourceKey: text("source_key"),
    ...timestamps()
  },
  (table) => [
    uniqueIndex("media_assets_object_key_unique").on(table.objectKey),
    uniqueIndex("media_assets_source_key_unique").on(table.sourceKey),
    index("media_assets_created_at_idx").on(table.createdAt)
  ]
)

export const posts = sqliteTable(
  "posts",
  {
    id: primaryId(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    status: text("status", { enum: contentStatusValues })
      .notNull()
      .default("draft"),
    coverMediaId: text("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null"
    }),
    tags: text("tags", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    body: text("body", { mode: "json" }).$type<NotionBlockTree>(),
    notionPageId: text("notion_page_id"),
    slugHistory: text("slug_history", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    ...timestamps()
  },
  (table) => [
    uniqueIndex("posts_slug_unique").on(table.slug),
    uniqueIndex("posts_notion_page_id_unique").on(table.notionPageId),
    index("posts_status_published_at_idx").on(table.status, table.publishedAt)
  ]
)

export const projects = sqliteTable(
  "projects",
  {
    id: primaryId(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    category: text("category", { enum: projectCategoryValues }).notNull(),
    excerpt: text("excerpt"),
    status: text("status", { enum: contentStatusValues })
      .notNull()
      .default("draft"),
    coverMediaId: text("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null"
    }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    body: text("body", { mode: "json" }).$type<NotionBlockTree>(),
    notionPageId: text("notion_page_id"),
    slugHistory: text("slug_history", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    ...timestamps()
  },
  (table) => [
    uniqueIndex("projects_category_slug_unique").on(table.category, table.slug),
    uniqueIndex("projects_notion_page_id_unique").on(table.notionPageId),
    index("projects_category_status_published_at_idx").on(
      table.category,
      table.status,
      table.publishedAt
    )
  ]
)

export const pages = sqliteTable(
  "pages",
  {
    id: primaryId(),
    key: text("key").notNull(),
    title: text("title").notNull(),
    status: text("status", { enum: contentStatusValues })
      .notNull()
      .default("draft"),
    metadata: text("metadata", { mode: "json" })
      .$type<Record<string, unknown>>()
      .default(sql`'{}'`),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    body: text("body", { mode: "json" }).$type<NotionBlockTree>(),
    notionPageId: text("notion_page_id"),
    ...timestamps()
  },
  (table) => [
    uniqueIndex("pages_key_unique").on(table.key),
    uniqueIndex("pages_notion_page_id_unique").on(table.notionPageId),
    index("pages_status_idx").on(table.status)
  ]
)

export const photos = sqliteTable(
  "photos",
  {
    id: primaryId(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    status: text("status", { enum: contentStatusValues })
      .notNull()
      .default("draft"),
    mediaId: text("media_id").references(() => mediaAssets.id, {
      onDelete: "set null"
    }),
    body: text("body", { mode: "json" }).$type<NotionBlockTree>(),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    notionPageId: text("notion_page_id"),
    slugHistory: text("slug_history", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    ...timestamps()
  },
  (table) => [
    uniqueIndex("photos_slug_unique").on(table.slug),
    uniqueIndex("photos_notion_page_id_unique").on(table.notionPageId),
    index("photos_status_published_at_idx").on(table.status, table.publishedAt)
  ]
)

export const photoProjects = sqliteTable(
  "photo_projects",
  {
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" })
  },
  (table) => [
    uniqueIndex("photo_projects_photo_project_unique").on(
      table.photoId,
      table.projectId
    ),
    index("photo_projects_project_idx").on(table.projectId)
  ]
)

export const siteNavigationSettings = sqliteTable("site_navigation_settings", {
  id: text("id").primaryKey().default("main"),
  blogEnabled: integer("blog_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  photographyEnabled: integer("photography_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  softwareEnabled: integer("software_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  storeEnabled: integer("store_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  ...timestamps()
})
