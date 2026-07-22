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
    // Which assessment package was bought ('basic' | 'comprehensive'; see
    // ASSESSMENT_PACKAGES in @pbh/booking). Taken from the PaymentIntent's
    // metadata, which we set server-side at Session creation — the amount alone
    // can't identify the package once prices change. Nullable: rows written
    // before packages existed have no value, and backfilling them from amount
    // would be a guess.
    packageKey: text("package_key"),
    status: text().notNull(), // 'pending' | 'succeeded' | 'failed' | 'refunded'
    isHsaFsa: boolean("is_hsa_fsa").notNull().default(false),
    cardBrand: text("card_brand"),
    cardLast4: text("card_last4"),
    succeededAt: timestamp("succeeded_at", { withTimezone: true }),
    // Set the moment this payment's post-checkout sign-in handoff is redeemed at
    // the funnel. The handoff token is a login credential, so it must be usable
    // exactly once: claiming it is an atomic UPDATE on this column, which also
    // binds the sign-in to a real `succeeded` payment rather than to a signature
    // alone. Nullable — most rows are never handed off (webhook-only fulfilment,
    // or a customer who signed in by magic link instead).
    handoffConsumedAt: timestamp("handoff_consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("payments_user_id_idx").on(t.userId)],
  // stripe_payment_intent_id is already indexed by its unique constraint.
);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
