CREATE TABLE "license_command_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hash" text NOT NULL,
	"actor_id" text NOT NULL,
	"app_id" uuid,
	"environment" text,
	"request_hash" text NOT NULL,
	"response_ciphertext" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "license_command_requests_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
ALTER TABLE "code_redemptions" ADD COLUMN "activation_lookup" text;--> statement-breakpoint
ALTER TABLE "license_command_requests" ADD CONSTRAINT "license_command_requests_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE no action ON UPDATE no action;