import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

/**
 * Per-(user, campaign) Linus enrollment state. We persist the enrollmentId so a
 * COMPLETED enrollment's report stays reachable (the report is keyed by the
 * completed enrollmentId), the latest assessment `redirect` link, and a
 * `hasReport` flag. The Linus API only keeps one *active* enrollment per
 * campaign, so re-POSTing after completion would mint a new enrollment and
 * orphan the report — this table lets us stop POSTing once a report exists.
 * One row per (user, campaign); upserted.
 */
export const linusEnrollments = pgTable(
  "linus_enrollments",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    /** Linus campaign UUID this enrollment is for. */
    campaignId: text("campaign_id").notNull(),
    /** Linus enrollment UUID — used to fetch this enrollment's report. */
    enrollmentId: text("enrollment_id").notNull(),
    /** The latest subject-facing assessment link. */
    redirect: text().notNull(),
    /** True once a report has been generated for this enrollment. */
    hasReport: boolean("has_report").notNull().default(false),
    /**
     * The track this assessment was *produced* under — not the user's current
     * one. An upgraded user's older assessments were carried out under the
     * wellness track, and relabelling them with clinical vocabulary after the
     * upgrade would describe work that never happened. Assessment-level copy
     * reads this column; page chrome reads the current entitlement.
     *
     * Defaulted for the same reason as `payments.track`: every enrollment that
     * predates the clinical track was a wellness one.
     */
    track: text().notNull().default("wellness"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`)
      // See users.updatedAt: return a Date so the UPDATE encoder doesn't choke
      // on a raw SQL value.
      .$onUpdate(() => new Date()),
  },
  (t) => [
    unique("linus_enrollments_user_campaign_uq").on(t.userId, t.campaignId),
    index("linus_enrollments_user_id_idx").on(t.userId),
  ],
);

export type LinusEnrollment = typeof linusEnrollments.$inferSelect;
export type NewLinusEnrollment = typeof linusEnrollments.$inferInsert;
