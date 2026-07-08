CREATE TABLE "linus_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"campaign_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"redirect" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "linus_enrollments_user_campaign_uq" UNIQUE("user_id","campaign_id")
);
--> statement-breakpoint
ALTER TABLE "linus_enrollments" ADD CONSTRAINT "linus_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "linus_enrollments_user_id_idx" ON "linus_enrollments" USING btree ("user_id");