ALTER TABLE "users" ADD COLUMN "linus_participant_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_linus_participant_id_unique" UNIQUE("linus_participant_id");--> statement-breakpoint
-- Backfill legacy gender/education values to the canonical Linus enum values
-- now stored by the details form. No-op on a fresh/pre-launch DB.
UPDATE "users" SET "gender" = 'MALE' WHERE "gender" = 'Male';--> statement-breakpoint
UPDATE "users" SET "gender" = 'FEMALE' WHERE "gender" = 'Female';--> statement-breakpoint
UPDATE "users" SET "gender" = 'OTHER' WHERE "gender" = 'Other';--> statement-breakpoint
UPDATE "users" SET "education_level" = 'ED_YEARS_11' WHERE "education_level" = 'Less than high school';--> statement-breakpoint
UPDATE "users" SET "education_level" = 'ED_YEARS_12' WHERE "education_level" = 'High school graduate';--> statement-breakpoint
UPDATE "users" SET "education_level" = 'ED_YEARS_14' WHERE "education_level" = 'Associates (2 years)';--> statement-breakpoint
UPDATE "users" SET "education_level" = 'ED_YEARS_16' WHERE "education_level" = 'Bachelors (4 years)';--> statement-breakpoint
UPDATE "users" SET "education_level" = 'ED_YEARS_18' WHERE "education_level" = 'Masters (6 years)';--> statement-breakpoint
UPDATE "users" SET "education_level" = 'ED_YEARS_20' WHERE "education_level" = 'Doctorate (8+ years)';