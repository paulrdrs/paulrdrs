CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"object_key" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"attribution" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"source_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"published_at" timestamp with time zone,
	"body" jsonb,
	"notion_page_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photo_projects" (
	"photo_id" text NOT NULL,
	"project_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"media_id" text,
	"body" jsonb,
	"published_at" timestamp with time zone,
	"notion_page_id" text,
	"slug_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"cover_media_id" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"published_at" timestamp with time zone,
	"body" jsonb,
	"notion_page_id" text,
	"slug_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"excerpt" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"cover_media_id" text,
	"seo_title" text,
	"seo_description" text,
	"published_at" timestamp with time zone,
	"body" jsonb,
	"notion_page_id" text,
	"slug_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_navigation_settings" (
	"id" text PRIMARY KEY DEFAULT 'main' NOT NULL,
	"blog_enabled" boolean DEFAULT true NOT NULL,
	"photography_enabled" boolean DEFAULT true NOT NULL,
	"software_enabled" boolean DEFAULT true NOT NULL,
	"store_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "photo_projects" ADD CONSTRAINT "photo_projects_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_projects" ADD CONSTRAINT "photo_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_object_key_unique" ON "media_assets" USING btree ("object_key");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_source_key_unique" ON "media_assets" USING btree ("source_key");--> statement-breakpoint
CREATE INDEX "media_assets_created_at_idx" ON "media_assets" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "pages_key_unique" ON "pages" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "pages_notion_page_id_unique" ON "pages" USING btree ("notion_page_id");--> statement-breakpoint
CREATE INDEX "pages_status_idx" ON "pages" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "photo_projects_photo_project_unique" ON "photo_projects" USING btree ("photo_id","project_id");--> statement-breakpoint
CREATE INDEX "photo_projects_project_idx" ON "photo_projects" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "photos_slug_unique" ON "photos" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "photos_notion_page_id_unique" ON "photos" USING btree ("notion_page_id");--> statement-breakpoint
CREATE INDEX "photos_status_published_at_idx" ON "photos" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_unique" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_notion_page_id_unique" ON "posts" USING btree ("notion_page_id");--> statement-breakpoint
CREATE INDEX "posts_status_published_at_idx" ON "posts" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_category_slug_unique" ON "projects" USING btree ("category","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_notion_page_id_unique" ON "projects" USING btree ("notion_page_id");--> statement-breakpoint
CREATE INDEX "projects_category_status_published_at_idx" ON "projects" USING btree ("category","status","published_at");