CREATE TYPE "public"."purchase_audit_action" AS ENUM('grant', 'revoke');--> statement-breakpoint
CREATE TABLE "purchase_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"buyer_email" text NOT NULL,
	"project_title" text NOT NULL,
	"actor_email" text NOT NULL,
	"action" "purchase_audit_action" NOT NULL,
	"reason" text,
	"amount_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchase_audit_log" ADD CONSTRAINT "purchase_audit_log_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_audit_log" ADD CONSTRAINT "purchase_audit_log_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_audit_log" ADD CONSTRAINT "purchase_audit_log_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "purchase_audit_log_created_idx" ON "purchase_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "purchase_audit_log_purchase_idx" ON "purchase_audit_log" USING btree ("purchase_id");