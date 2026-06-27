ALTER TABLE "media_assets" ADD COLUMN "source_key" text;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "body" jsonb;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "notion_page_id" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "body" jsonb;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "notion_page_id" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "slug_history" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "body" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "notion_page_id" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "slug_history" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_source_key_unique" ON "media_assets" USING btree ("source_key");--> statement-breakpoint
CREATE UNIQUE INDEX "pages_notion_page_id_unique" ON "pages" USING btree ("notion_page_id");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_notion_page_id_unique" ON "posts" USING btree ("notion_page_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_notion_page_id_unique" ON "projects" USING btree ("notion_page_id");