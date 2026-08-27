ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "card_exp_month" integer;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "card_exp_year" integer;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id");