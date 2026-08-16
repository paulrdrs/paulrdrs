import type { NotionBlockTree } from "@paulrdrs/content/blocks"
import {
  contentStatusValues,
  projectCategoryValues
} from "@paulrdrs/content/content"
import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core"

// Fresh `created_at` / `updated_at` column builders for tables that track both.
// `updated_at` is bumped explicitly in app code.
const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
})

const primaryId = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())

export const mediaAssets = pgTable(
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
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`),
    sourceKey: text("source_key"),
    ...timestamps()
  },
  (table) => [
    uniqueIndex("media_assets_object_key_unique").on(table.objectKey),
    uniqueIndex("media_assets_source_key_unique").on(table.sourceKey),
    index("media_assets_created_at_idx").on(table.createdAt)
  ]
)

export const posts = pgTable(
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
    tags: jsonb("tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    body: jsonb("body").$type<NotionBlockTree>(),
    notionPageId: text("notion_page_id"),
    slugHistory: jsonb("slug_history")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    ...timestamps()
  },
  (table) => [
    uniqueIndex("posts_slug_unique").on(table.slug),
    uniqueIndex("posts_notion_page_id_unique").on(table.notionPageId),
    index("posts_status_published_at_idx").on(table.status, table.publishedAt)
  ]
)

export const projects = pgTable(
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
    sortOrder: integer("sort_order").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    body: jsonb("body").$type<NotionBlockTree>(),
    notionPageId: text("notion_page_id"),
    slugHistory: jsonb("slug_history")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    ...timestamps()
  },
  (table) => [
    uniqueIndex("projects_category_slug_unique").on(table.category, table.slug),
    uniqueIndex("projects_notion_page_id_unique").on(table.notionPageId),
    index("projects_category_status_sort_order_idx").on(
      table.category,
      table.status,
      table.sortOrder
    )
  ]
)

export const pages = pgTable(
  "pages",
  {
    id: primaryId(),
    key: text("key").notNull(),
    title: text("title").notNull(),
    status: text("status", { enum: contentStatusValues })
      .notNull()
      .default("draft"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    body: jsonb("body").$type<NotionBlockTree>(),
    notionPageId: text("notion_page_id"),
    ...timestamps()
  },
  (table) => [
    uniqueIndex("pages_key_unique").on(table.key),
    uniqueIndex("pages_notion_page_id_unique").on(table.notionPageId),
    index("pages_status_idx").on(table.status)
  ]
)

export const photos = pgTable(
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
    body: jsonb("body").$type<NotionBlockTree>(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    notionPageId: text("notion_page_id"),
    slugHistory: jsonb("slug_history")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    ...timestamps()
  },
  (table) => [
    uniqueIndex("photos_slug_unique").on(table.slug),
    uniqueIndex("photos_notion_page_id_unique").on(table.notionPageId),
    index("photos_status_published_at_idx").on(table.status, table.publishedAt)
  ]
)

export const photoProjects = pgTable(
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

export const siteNavigationSettings = pgTable("site_navigation_settings", {
  id: text("id").primaryKey().default("main"),
  blogEnabled: boolean("blog_enabled").notNull().default(true),
  photographyEnabled: boolean("photography_enabled").notNull().default(true),
  softwareEnabled: boolean("software_enabled").notNull().default(true),
  storeEnabled: boolean("store_enabled").notNull().default(true),
  ...timestamps()
})
