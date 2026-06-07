CREATE TYPE "public"."analytics_content_type" AS ENUM('page', 'post', 'project');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."project_category" AS ENUM('photography', 'software');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"content_type" "analytics_content_type",
	"content_id" uuid,
	"referrer_origin" text,
	"device_category" varchar(32),
	"visitor_hash" varchar(128) NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"object_key" text NOT NULL,
	"filename" text NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"size_bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"attribution" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(120) NOT NULL,
	"title" varchar(255) NOT NULL,
	"body_markdown" text DEFAULT '' NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text,
	"body_markdown" text DEFAULT '' NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"cover_media_id" uuid,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"seo_title" varchar(255),
	"seo_description" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"category" "project_category" NOT NULL,
	"excerpt" text,
	"body_markdown" text DEFAULT '' NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"cover_media_id" uuid,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"seo_title" varchar(255),
	"seo_description" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_media_id_media_assets_id_fk" FOREIGN KEY ("cover_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_events_occurred_at_idx" ON "analytics_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "analytics_events_path_occurred_at_idx" ON "analytics_events" USING btree ("path","occurred_at");--> statement-breakpoint
CREATE INDEX "analytics_events_content_idx" ON "analytics_events" USING btree ("content_type","content_id");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_object_key_unique" ON "media_assets" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "media_assets_created_at_idx" ON "media_assets" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "pages_key_unique" ON "pages" USING btree ("key");--> statement-breakpoint
CREATE INDEX "pages_status_idx" ON "pages" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_unique" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_status_published_at_idx" ON "posts" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_category_slug_unique" ON "projects" USING btree ("category","slug");--> statement-breakpoint
CREATE INDEX "projects_category_status_published_at_idx" ON "projects" USING btree ("category","status","published_at");