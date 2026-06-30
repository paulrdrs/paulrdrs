import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core"
import type { NotionBlockTree } from "../notion/types"

export const contentStatus = pgEnum("content_status", ["draft", "published"])

export const projectCategory = pgEnum("project_category", [
  "photography",
  "software"
])

export const analyticsContentType = pgEnum("analytics_content_type", [
  "page",
  "post",
  "project"
])

// Fresh `created_at` / `updated_at` column builders for tables that track both.
// Returned from a factory so each table gets its own builder instances.
const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
})

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    objectKey: text("object_key").notNull(),
    filename: text("filename").notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    altText: text("alt_text"),
    attribution: text("attribution"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
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
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    excerpt: text("excerpt"),
    status: contentStatus("status").notNull().default("draft"),
    coverMediaId: uuid("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null"
    }),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    body: jsonb("body").$type<NotionBlockTree>(),
    notionPageId: text("notion_page_id"),
    slugHistory: jsonb("slug_history").$type<string[]>().notNull().default([]),
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
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    category: projectCategory("category").notNull(),
    excerpt: text("excerpt"),
    status: contentStatus("status").notNull().default("draft"),
    coverMediaId: uuid("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null"
    }),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    body: jsonb("body").$type<NotionBlockTree>(),
    notionPageId: text("notion_page_id"),
    slugHistory: jsonb("slug_history").$type<string[]>().notNull().default([]),
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

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: varchar("key", { length: 120 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    status: contentStatus("status").notNull().default("draft"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
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

export const siteNavigationSettings = pgTable("site_navigation_settings", {
  id: varchar("id", { length: 32 }).primaryKey().default("main"),
  blogEnabled: boolean("blog_enabled").notNull().default(true),
  projectsEnabled: boolean("projects_enabled").notNull().default(true),
  photographyEnabled: boolean("photography_enabled").notNull().default(true),
  softwareEnabled: boolean("software_enabled").notNull().default(true),
  storeEnabled: boolean("store_enabled").notNull().default(true),
  ...timestamps()
})

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    path: text("path").notNull(),
    contentType: analyticsContentType("content_type"),
    contentId: uuid("content_id"),
    referrerOrigin: text("referrer_origin"),
    deviceCategory: varchar("device_category", { length: 32 }),
    visitorHash: varchar("visitor_hash", { length: 128 }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({})
  },
  (table) => [
    index("analytics_events_occurred_at_idx").on(table.occurredAt),
    index("analytics_events_path_occurred_at_idx").on(
      table.path,
      table.occurredAt
    ),
    index("analytics_events_content_idx").on(table.contentType, table.contentId)
  ]
)
