import { sql } from "drizzle-orm";
import { char, date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { citext } from "./_types";

/**
 * Account identity. PII; conservatively HIPAA-adjacent.
 *
 * No card data ever lives here (that stays at Stripe) and no clinical /
 * assessment data (owned by the wellness app). See
 * docs/sow2/technical/database-plan.md.
 */
export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: citext().notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  // Collected in step 2 of signup, so nullable until that step completes.
  passwordHash: text("password_hash"),
  // `string` mode: a plain calendar date ("YYYY-MM-DD"), no time/timezone.
  dateOfBirth: date("date_of_birth", { mode: "string" }),
  zip: text(),
  stateOfResidence: char("state_of_residence", { length: 2 }),
  stripeCustomerId: text("stripe_customer_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`)
    // Return a Date, not sql`now()`: drizzle's UPDATE builder params the
    // $onUpdate result through the column encoder without checking for SQL
    // (unlike the INSERT path), so a raw SQL value hits `value.toISOString()`
    // and throws. A Date encodes cleanly.
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
