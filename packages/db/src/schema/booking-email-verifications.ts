import { index, pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Single-use email-confirmation tokens for the booking flow.
 *
 * Signup is gated on proving the address is real: a typo means a paying customer
 * we can never reach — no receipt, no assessment-ready mail, no funnel sign-in
 * link. Clicking the emailed link consumes a row here and stamps
 * `users.emailVerified`.
 *
 * Only the SHA-256 **hash** of the token is stored, never the token itself, so a
 * read of this table can't be replayed into someone's booking. Same shape the
 * Auth.js adapter uses for `verification_tokens` — kept separate from that table
 * because Auth.js owns it, and mixing our rows in muddies who is responsible for
 * what in an audit.
 *
 * Rows are kept after use (`consumedAt` set) rather than deleted: the audit trail
 * wants evidence of when an address was confirmed. Nothing sweeps expired rows
 * today — worth a job if volume grows.
 */
export const bookingEmailVerifications = pgTable(
  "booking_email_verifications",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    /** Null until redeemed. A non-null value makes the token unusable again. */
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  // Lookup on redeem is by token_hash (already unique-indexed). This index backs
  // the per-user reads: the resend throttle and the delete cascade.
  (t) => [index("booking_email_verifications_user_id_idx").on(t.userId)],
);

export type BookingEmailVerification =
  typeof bookingEmailVerifications.$inferSelect;
export type NewBookingEmailVerification =
  typeof bookingEmailVerifications.$inferInsert;
