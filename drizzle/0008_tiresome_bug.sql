CREATE TABLE "admin_totp_enrollments" (
	"member_id" uuid PRIMARY KEY NOT NULL,
	"secret_ciphertext" text NOT NULL,
	"recovery_hashes" jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_totp_enrollments" ADD CONSTRAINT "admin_totp_enrollments_member_id_admin_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."admin_members"("id") ON DELETE no action ON UPDATE no action;