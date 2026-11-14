CREATE TABLE "license_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"environment" text NOT NULL,
	"hash" text NOT NULL,
	"request_hash" text NOT NULL,
	"license_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "license_requests" ADD CONSTRAINT "license_requests_app_id_license_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."license_apps"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_requests" ADD CONSTRAINT "license_requests_license_id_access_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."access_licenses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "license_request_identity" ON "license_requests" USING btree ("app_id","environment","hash");