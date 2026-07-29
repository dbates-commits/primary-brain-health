-- IF NOT EXISTS is hand-added to drizzle's generated DDL, deliberately.
--
-- These two columns were applied to the production database ahead of this
-- migration, because the application code references them as soon as it
-- deploys (drizzle names every schema column in its INSERT, so signup fails
-- outright when one is missing) and Vercel preview deploys share the
-- production database. Migration 0008 could not be run to get here: it drops
-- users.message, which the currently-deployed production code still writes.
--
-- So this file has to survive being applied to a database that already has the
-- columns. Without IF NOT EXISTS, the next production `db:migrate` — which
-- runs 0008 then 0009 in order — would abort on "column already exists".
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "patient_first_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "patient_last_name" text;
