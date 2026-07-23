ALTER TABLE "payments" ADD COLUMN "track" text DEFAULT 'wellness' NOT NULL;--> statement-breakpoint
ALTER TABLE "linus_enrollments" ADD COLUMN "track" text DEFAULT 'wellness' NOT NULL;