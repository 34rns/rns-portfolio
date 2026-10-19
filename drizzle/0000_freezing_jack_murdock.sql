CREATE TYPE "public"."project_placement" AS ENUM('featured', 'unlisted');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'customer');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"cover_image_url" text,
	"gallery" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"live_url" text,
	"repo_url" text,
	"year" integer NOT NULL,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"placement" "project_placement" DEFAULT 'featured' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"theme" text DEFAULT 'professional' NOT NULL,
	"theme_options" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"price_cents" integer,
	"currency" text DEFAULT 'USD' NOT NULL,
	"provider_product_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password_hash" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
