ALTER TABLE "projects" ADD COLUMN "model_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "lighting" text DEFAULT 'studio' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "model_scale" real DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "model_offset_x" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "model_offset_y" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "model_offset_z" real DEFAULT 0 NOT NULL;