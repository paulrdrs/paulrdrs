CREATE TABLE "admin_passkeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"credential_id" text NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"transports" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"credential_device_type" varchar(32),
	"credential_backed_up" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "webauthn_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge" text NOT NULL,
	"email" varchar(320),
	"type" varchar(32) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "admin_passkeys_credential_id_unique" ON "admin_passkeys" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "admin_passkeys_email_idx" ON "admin_passkeys" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "webauthn_challenges_challenge_unique" ON "webauthn_challenges" USING btree ("challenge");--> statement-breakpoint
CREATE INDEX "webauthn_challenges_lookup_idx" ON "webauthn_challenges" USING btree ("challenge","type","expires_at");