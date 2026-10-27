CREATE TYPE "public"."license_event_action" AS ENUM('created', 'activated', 'revoked', 'unrevoked', 'extended', 'devices_reset', 'key_shown');--> statement-breakpoint
CREATE TYPE "public"."license_type" AS ENUM('permanent', 'timelimited');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('requested', 'contacted', 'paid', 'cancelled');--> statement-breakpoint
CREATE TABLE "license_activations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" uuid NOT NULL,
	"device_id" text NOT NULL,
	"device_name" text,
	"first_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" uuid NOT NULL,
	"action" "license_event_action" NOT NULL,
	"actor_email" text DEFAULT 'system' NOT NULL,
	"detail" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key_lookup" text NOT NULL,
	"key_ciphertext" text NOT NULL,
	"project_slugs" text[] DEFAULT '{}'::text[] NOT NULL,
	"type" "license_type" DEFAULT 'permanent' NOT NULL,
	"days" integer,
	"activate_by" timestamp with time zone,
	"max_devices" integer DEFAULT 2 NOT NULL,
	"activation_count" integer DEFAULT 0 NOT NULL,
	"first_activated_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_reason" text,
	"note" text,
	"order_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"size" integer,
	"content_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"token_ciphertext" text NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text,
	"method" text,
	"status" "order_status" DEFAULT 'requested' NOT NULL,
	"amount_cents" integer,
	"currency" text DEFAULT 'USD' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "download_url" text;--> statement-breakpoint
ALTER TABLE "license_activations" ADD CONSTRAINT "license_activations_license_id_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."licenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_events" ADD CONSTRAINT "license_events_license_id_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."licenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "license_activations_device_idx" ON "license_activations" USING btree ("license_id","device_id");--> statement-breakpoint
CREATE INDEX "license_events_created_idx" ON "license_events" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "licenses_key_lookup_idx" ON "licenses" USING btree ("key_lookup");--> statement-breakpoint
CREATE INDEX "licenses_created_idx" ON "licenses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "licenses_order_idx" ON "licenses" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "models_url_idx" ON "models" USING btree ("url");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_token_hash_idx" ON "orders" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "orders_project_idx" ON "orders" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_created_idx" ON "orders" USING btree ("created_at");