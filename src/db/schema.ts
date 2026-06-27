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
    ...timestamps()
  },
  (table) => [
    uniqueIndex("media_assets_object_key_unique").on(table.objectKey),
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
    bodyMarkdown: text("body_markdown").notNull().default(""),
    status: contentStatus("status").notNull().default("draft"),
    coverMediaId: uuid("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null"
    }),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps()
  },
  (table) => [
    uniqueIndex("posts_slug_unique").on(table.slug),
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
    bodyMarkdown: text("body_markdown").notNull().default(""),
    status: contentStatus("status").notNull().default("draft"),
    coverMediaId: uuid("cover_media_id").references(() => mediaAssets.id, {
      onDelete: "set null"
    }),
    links: jsonb("links")
      .$type<Array<{ label: string; url: string }>>()
      .notNull()
      .default([]),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps()
  },
  (table) => [
    uniqueIndex("projects_category_slug_unique").on(table.category, table.slug),
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
    bodyMarkdown: text("body_markdown").notNull().default(""),
    status: contentStatus("status").notNull().default("draft"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps()
  },
  (table) => [
    uniqueIndex("pages_key_unique").on(table.key),
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

export const adminPasskeys = pgTable(
  "admin_passkeys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 320 }).notNull(),
    credentialId: text("credential_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull().default(0),
    transports: jsonb("transports").$type<string[]>().notNull().default([]),
    credentialDeviceType: varchar("credential_device_type", { length: 32 }),
    credentialBackedUp: boolean("credential_backed_up")
      .notNull()
      .default(false),
    ...timestamps(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true })
  },
  (table) => [
    uniqueIndex("admin_passkeys_credential_id_unique").on(table.credentialId),
    index("admin_passkeys_email_idx").on(table.email)
  ]
)

export const webauthnChallenges = pgTable(
  "webauthn_challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    challenge: text("challenge").notNull(),
    email: varchar("email", { length: 320 }),
    type: varchar("type", { length: 32 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    uniqueIndex("webauthn_challenges_challenge_unique").on(table.challenge),
    index("webauthn_challenges_lookup_idx").on(
      table.challenge,
      table.type,
      table.expiresAt
    )
  ]
)

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 320 }).notNull(),
    tokenHash: varchar("token_hash", { length: 128 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow()
  },
  (table) => [
    uniqueIndex("auth_sessions_token_hash_unique").on(table.tokenHash),
    index("auth_sessions_email_idx").on(table.email),
    index("auth_sessions_expires_at_idx").on(table.expiresAt)
  ]
)
