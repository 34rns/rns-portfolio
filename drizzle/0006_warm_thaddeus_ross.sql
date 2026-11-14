CREATE TABLE "access_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" uuid NOT NULL,
	"device_hash" text NOT NULL,
	"name" text DEFAULT 'Device' NOT NULL,
	"deactivated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "access_grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" uuid NOT NULL,
	"code_id" uuid,
	"input" jsonb NOT NULL,
	"plan_priority" integer NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	"remaining_seconds" integer,
	"undone_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "access_licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"subject" text,
	"binding_hash" text NOT NULL,
	"activation_lookup" text NOT NULL,
	"activation_ciphertext" text NOT NULL,
	"max_devices" integer NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"paused_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"legacy_license_id" uuid,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "access_licenses_activation_lookup_unique" UNIQUE("activation_lookup")
);
--> statement-breakpoint
CREATE TABLE "admin_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid,
	"environment" text,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"target_id" text,
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"app_ids" jsonb NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_invites_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "admin_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"app_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"capabilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"disabled_at" timestamp with time zone,
	"session_version" integer DEFAULT 1 NOT NULL,
	"totp_ciphertext" text,
	"totp_step" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_members_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "admin_preferences" (
	"member_id" text PRIMARY KEY NOT NULL,
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_recovery_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"code_hash" text NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "admin_recovery_codes_code_hash_unique" UNIQUE("code_hash")
);
--> statement-breakpoint
CREATE TABLE "admin_saved_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" text NOT NULL,
	"resource" text NOT NULL,
	"name" text NOT NULL,
	"filters" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"name" text NOT NULL,
	"lookup" text NOT NULL,
	"prefix" text NOT NULL,
	"capabilities" jsonb NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_api_keys_lookup_unique" UNIQUE("lookup")
);
--> statement-breakpoint
CREATE TABLE "code_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"code_id" uuid NOT NULL,
	"license_id" uuid NOT NULL,
	"binding_hash" text NOT NULL,
	"idempotency_hash" text NOT NULL,
	"request_hash" text NOT NULL,
	"undone_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"linked_project_id" uuid,
	"config" jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "license_apps_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "license_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"webhook_id" uuid NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"leased_until" timestamp with time zone,
	"response_code" integer,
	"last_error" text,
	"delivered_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "license_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"subject" text NOT NULL,
	"customer_id" uuid,
	"name" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_integration_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"actor_id" text NOT NULL,
	"step" text NOT NULL,
	"passed" boolean NOT NULL,
	"evidence" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_job_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"result" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"type" text NOT NULL,
	"license_id" uuid,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_plan_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"feature_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_rate_buckets" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"window_at" timestamp with time zone NOT NULL,
	"locked_until" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_return_tickets" (
	"hash" text PRIMARY KEY NOT NULL,
	"app_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"license_id" uuid NOT NULL,
	"device_hash" text NOT NULL,
	"origin" text NOT NULL,
	"challenge" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "license_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"url" text NOT NULL,
	"secret_ciphertext" text NOT NULL,
	"previous_secret_ciphertext" text,
	"previous_secret_until" timestamp with time zone,
	"events" jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redeem_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"input" jsonb NOT NULL,
	"count" integer NOT NULL,
	"created_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"idempotency_hash" text NOT NULL,
	"request_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redeem_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"name" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redeem_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"key_lookup" text NOT NULL,
	"key_ciphertext" text NOT NULL,
	"masked" text NOT NULL,
	"grant" jsonb NOT NULL,
	"max_redemptions" integer NOT NULL,
	"redemption_count" integer DEFAULT 0 NOT NULL,
	"max_devices" integer NOT NULL,
	"redeem_by" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"campaign_id" uuid,
	"batch_id" uuid,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "redeem_codes_key_lookup_unique" UNIQUE("key_lookup"),
	CONSTRAINT "redeem_code_usage_bound" CHECK ("redeem_codes"."redemption_count">=0 AND "redeem_codes"."redemption_count"<="redeem_codes"."max_redemptions")
);
--> statement-breakpoint
CREATE TABLE "redeem_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"name" text NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_devices" ADD CONSTRAINT "access_devices_license_id_access_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."access_licenses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_license_id_access_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."access_licenses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_code_id_redeem_codes_id_fk" FOREIGN KEY ("code_id") REFERENCES "public"."redeem_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_licenses" ADD CONSTRAINT "access_licenses_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_recovery_codes" ADD CONSTRAINT "admin_recovery_codes_member_id_admin_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."admin_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_api_keys" ADD CONSTRAINT "app_api_keys_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_redemptions" ADD CONSTRAINT "code_redemptions_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_redemptions" ADD CONSTRAINT "code_redemptions_code_id_redeem_codes_id_fk" FOREIGN KEY ("code_id") REFERENCES "public"."redeem_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_redemptions" ADD CONSTRAINT "code_redemptions_license_id_access_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."access_licenses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_deliveries" ADD CONSTRAINT "license_deliveries_event_id_license_outbox_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."license_outbox"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_deliveries" ADD CONSTRAINT "license_deliveries_webhook_id_license_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."license_webhooks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_features" ADD CONSTRAINT "license_features_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_identities" ADD CONSTRAINT "license_identities_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_integration_checks" ADD CONSTRAINT "license_integration_checks_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_outbox" ADD CONSTRAINT "license_outbox_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_plan_features" ADD CONSTRAINT "license_plan_features_plan_id_license_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."license_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_plan_features" ADD CONSTRAINT "license_plan_features_feature_id_license_features_id_fk" FOREIGN KEY ("feature_id") REFERENCES "public"."license_features"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_plans" ADD CONSTRAINT "license_plans_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_return_tickets" ADD CONSTRAINT "license_return_tickets_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_webhooks" ADD CONSTRAINT "license_webhooks_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeem_batches" ADD CONSTRAINT "redeem_batches_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeem_campaigns" ADD CONSTRAINT "redeem_campaigns_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeem_codes" ADD CONSTRAINT "redeem_codes_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeem_codes" ADD CONSTRAINT "redeem_codes_campaign_id_redeem_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."redeem_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeem_codes" ADD CONSTRAINT "redeem_codes_batch_id_redeem_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."redeem_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeem_presets" ADD CONSTRAINT "redeem_presets_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "access_device_identity" ON "access_devices" USING btree ("license_id","device_hash");--> statement-breakpoint
CREATE INDEX "access_grant_expiry" ON "access_grants" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "access_grant_license" ON "access_grants" USING btree ("license_id");--> statement-breakpoint
CREATE UNIQUE INDEX "access_license_binding" ON "access_licenses" USING btree ("app_id","environment","binding_hash");--> statement-breakpoint
CREATE INDEX "access_license_app_date" ON "access_licenses" USING btree ("app_id","environment","created_at");--> statement-breakpoint
CREATE INDEX "admin_audit_app_date" ON "admin_audit_events" USING btree ("app_id","environment","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "redemption_idempotency" ON "code_redemptions" USING btree ("app_id","environment","idempotency_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "redemption_code_binding" ON "code_redemptions" USING btree ("code_id","binding_hash");--> statement-breakpoint
CREATE INDEX "redemption_app_date" ON "code_redemptions" USING btree ("app_id","environment","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "license_delivery_event_hook" ON "license_deliveries" USING btree ("event_id","webhook_id");--> statement-breakpoint
CREATE INDEX "license_delivery_due" ON "license_deliveries" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE UNIQUE INDEX "license_feature_app_key" ON "license_features" USING btree ("app_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "license_identity_subject" ON "license_identities" USING btree ("app_id","environment","subject");--> statement-breakpoint
CREATE INDEX "license_outbox_pending" ON "license_outbox" USING btree ("processed_at","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "license_plan_feature_pair" ON "license_plan_features" USING btree ("plan_id","feature_id");--> statement-breakpoint
CREATE UNIQUE INDEX "license_plan_app_key" ON "license_plans" USING btree ("app_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "redeem_batch_request" ON "redeem_batches" USING btree ("app_id","environment","idempotency_hash");--> statement-breakpoint
CREATE INDEX "redeem_code_app_env_date" ON "redeem_codes" USING btree ("app_id","environment","created_at");