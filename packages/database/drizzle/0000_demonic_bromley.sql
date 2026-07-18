CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`width` integer,
	`height` integer,
	`alt_text` text,
	`attribution` text,
	`metadata` text DEFAULT '{}',
	`source_key` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_object_key_unique` ON `media_assets` (`object_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_source_key_unique` ON `media_assets` (`source_key`);--> statement-breakpoint
CREATE INDEX `media_assets_created_at_idx` ON `media_assets` (`created_at`);--> statement-breakpoint
CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`metadata` text DEFAULT '{}',
	`published_at` integer,
	`body` text,
	`notion_page_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pages_key_unique` ON `pages` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `pages_notion_page_id_unique` ON `pages` (`notion_page_id`);--> statement-breakpoint
CREATE INDEX `pages_status_idx` ON `pages` (`status`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`cover_media_id` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`published_at` integer,
	`body` text,
	`notion_page_id` text,
	`slug_history` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`cover_media_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `posts_notion_page_id_unique` ON `posts` (`notion_page_id`);--> statement-breakpoint
CREATE INDEX `posts_status_published_at_idx` ON `posts` (`status`,`published_at`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`category` text NOT NULL,
	`excerpt` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`cover_media_id` text,
	`seo_title` text,
	`seo_description` text,
	`published_at` integer,
	`body` text,
	`notion_page_id` text,
	`slug_history` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`cover_media_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_category_slug_unique` ON `projects` (`category`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_notion_page_id_unique` ON `projects` (`notion_page_id`);--> statement-breakpoint
CREATE INDEX `projects_category_status_published_at_idx` ON `projects` (`category`,`status`,`published_at`);--> statement-breakpoint
CREATE TABLE `site_navigation_settings` (
	`id` text PRIMARY KEY DEFAULT 'main' NOT NULL,
	`blog_enabled` integer DEFAULT true NOT NULL,
	`projects_enabled` integer DEFAULT true NOT NULL,
	`photography_enabled` integer DEFAULT true NOT NULL,
	`software_enabled` integer DEFAULT true NOT NULL,
	`store_enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
