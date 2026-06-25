import { index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Cached Linus enrollment links, captured from the `POST .../enrollments`
 * response. We persist the `redirect` here because the post-payment page can't
 * rely on the list-enrollments endpoint returning it — storing it at enroll
 * time means the page always has a working assessment link without re-calling
 * Linus. One active enrollment per (user, campaign), so we upsert on conflict.
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
    /** Linus enrollment UUID returned by the enroll call. */
    enrollmentId: text("enrollment_id").notNull(),
    /** The subject-facing assessment link. */
    redirect: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
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
