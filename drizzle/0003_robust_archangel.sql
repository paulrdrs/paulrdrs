CREATE TABLE "site_navigation_settings" (
	"id" varchar(32) PRIMARY KEY DEFAULT 'main' NOT NULL,
	"blog_enabled" boolean DEFAULT true NOT NULL,
	"projects_enabled" boolean DEFAULT true NOT NULL,
	"photography_enabled" boolean DEFAULT true NOT NULL,
	"software_enabled" boolean DEFAULT true NOT NULL,
	"store_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
