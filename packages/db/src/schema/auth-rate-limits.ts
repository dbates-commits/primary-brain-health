import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * One row per sign-in attempt, used to throttle the magic-link form.
 *
 * Sign-in tells the caller whether an address has an account (see the
 * disclosure note in `docs/auth.md`), which makes the form an enumeration
 * oracle. Throttling is what bounds it: an attacker can still learn about the
 * addresses they try, but not many of them, and not quickly.
 *
 * `bucket` is what the limit is counted against, already hashed and prefixed
 * with its kind — `ip:<hmac>` or `email:<hmac>`. Storing the hash rather than
 * the value matters more here than elsewhere: the raw column would otherwise
 * accumulate a list of email addresses that people typed into a brain-health
 * site, most of which have no account and never consented to anything. IPs use
 * the same keyed hash as `audit_log.ip_hash`, so a throttled bucket can be
 * lined up against the audit trail without either table holding an address.
 *
 * Rows are disposable — they exist only for the length of the window and are
 * swept by the limiter as it goes. Nothing here is an audit record; the
 * `signin_rate_limited` event in `audit_log` is.
 */
export const authRateLimits = pgTable(
  "auth_rate_limits",
  {
    id: uuid().primaryKey().defaultRandom(),
    bucket: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  // Two shapes, two indexes. The count is "how many rows for these buckets
  // since T", which wants `bucket` leading; the sweep is "everything older than
  // T", which cannot use that index at all — `created_at` is not its leading
  // column, so the delete would fall back to a sequential scan on every single
  // sign-in attempt, growing with the table rather than with the window.
  (t) => [
    index("auth_rate_limits_bucket_created_at_idx").on(t.bucket, t.createdAt),
    index("auth_rate_limits_created_at_idx").on(t.createdAt),
  ],
);

export type AuthRateLimit = typeof authRateLimits.$inferSelect;
export type NewAuthRateLimit = typeof authRateLimits.$inferInsert;
