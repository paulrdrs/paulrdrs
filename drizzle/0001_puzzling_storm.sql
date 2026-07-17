CREATE TABLE `photo_projects` (
	`photo_id` text NOT NULL,
	`project_id` text NOT NULL,
	FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `photo_projects_photo_project_unique` ON `photo_projects` (`photo_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `photo_projects_project_idx` ON `photo_projects` (`project_id`);--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`media_id` text,
	`body` text,
	`published_at` integer,
	`notion_page_id` text,
	`slug_history` text DEFAULT '[]' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`media_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `photos_slug_unique` ON `photos` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `photos_notion_page_id_unique` ON `photos` (`notion_page_id`);--> statement-breakpoint
CREATE INDEX `photos_status_published_at_idx` ON `photos` (`status`,`published_at`);