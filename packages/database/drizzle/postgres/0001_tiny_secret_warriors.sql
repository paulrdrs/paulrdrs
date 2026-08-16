DROP INDEX "projects_category_status_published_at_idx";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "projects_category_status_sort_order_idx" ON "projects" USING btree ("category","status","sort_order");