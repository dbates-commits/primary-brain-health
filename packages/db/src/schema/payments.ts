import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Internal mirror of the Stripe payment lifecycle. Never holds a full PAN /
 * CVV — only the non-sensitive brand + last4 that Stripe returns. The source
 * of truth is always Stripe; rows here are written from webhook events
 * (pbh-bws.28).
 */
export const payments = pgTable(
  "payments",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
    amountCents: integer("amount_cents").notNull(),
    currency: text().notNull().default("usd"),
    status: text().notNull(), // 'pending' | 'succeeded' | 'failed' | 'refunded'
    /**
     * Which product this purchase was: 'wellness' | 'clinical'. An immutable
     * record of what was bought, NOT the buyer's current entitlement — a user
     * who upgrades has one row of each. Current entitlement is derived as the
     * highest track across their succeeded rows (see `getEntitledTrack`), so a
     * refund automatically drops them back without a second column to update.
     *
     * The default exists so the column could be added not-null to a table that
     * already had rows: every payment taken before the clinical track existed
     * was a wellness purchase. The write path always sets it explicitly.
     */
    track: text().notNull().default("wellness"),
    isHsaFsa: boolean("is_hsa_fsa").notNull().default(false),
    cardBrand: text("card_brand"),
    cardLast4: text("card_last4"),
    succeededAt: timestamp("succeeded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("payments_user_id_idx").on(t.userId)],
  // stripe_payment_intent_id is already indexed by its unique constraint.
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
