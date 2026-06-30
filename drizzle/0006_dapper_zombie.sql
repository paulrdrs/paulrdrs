DROP TABLE "admin_passkeys" CASCADE;--> statement-breakpoint
DROP TABLE "auth_sessions" CASCADE;--> statement-breakpoint
DROP TABLE "webauthn_challenges" CASCADE;--> statement-breakpoint
ALTER TABLE "pages" DROP COLUMN "body_markdown";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "body_markdown";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "body_markdown";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "links";