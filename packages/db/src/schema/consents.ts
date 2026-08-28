import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Versioned consent records: wellness consent + HIPAA NPP acknowledgments.
 * Append-only in practice — each acknowledgment is a new row, never updated.
 */
export const consents = pgTable(
  "consents",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    consentType: text("consent_type").notNull(), // 'wellness' | 'hipaa_npp'
    version: text().notNull(), // e.g. '2026-06-01'
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipHash: text("ip_hash").notNull(),
    userAgent: text("user_agent"),
  },
  (t) => [
    index("consents_user_id_idx").on(t.userId),
    /**
     * One acknowledgment per user, per type, per version (pbh-3u1).
     *
     * Append-only means a *new* version is a new row — that still works. What it
     * never meant is the same version twice: re-submitting the consent step used
     * to insert a second identical pair, and nothing said which was operative.
     * The rows are evidence, so the modal's re-entry lock is not a control; this
     * is. `recordConsentCore` inserts with `onConflictDoNothing`, so a resubmit
     * is a no-op rather than an error the customer has to read.
     */
    uniqueIndex("consents_user_id_consent_type_version_key").on(
      t.userId,
      t.consentType,
      t.version,
    ),
  ],
);

export type Consent = typeof consents.$inferSelect;
export type NewConsent = typeof consents.$inferInsert;
