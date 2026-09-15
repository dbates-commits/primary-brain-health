import "server-only";

import { and, count, gt, inArray, lt } from "drizzle-orm";
import { authRateLimits, db } from "@pbh/db";
import { hashIdentifier } from "@pbh/booking/server";

/**
 * Throttle for the `/internal` password prompt.
 *
 * One shared password, a week-long cookie and an unthrottled server action is a
 * password anyone can simply guess at: nothing else bounds how many attempts a
 * caller gets. This is that bound, and it reuses the `auth_rate_limits` table
 * and bucket shape the sign-in throttle already uses — same disposable rows,
 * same hashed identifiers, swept as it goes.
 *
 * Per-IP only. There is no second identifier to count against: the form asks
 * for one field and it is the secret itself.
 */

/** How far back attempts are counted. */
export const UNLOCK_WINDOW_SECONDS = 15 * 60;

/**
 * Ten in a quarter-hour. Higher than sign-in's five because a password typed
 * from a Slack message gets fumbled, and lower than anything that makes a
 * dictionary worth starting: ten every fifteen minutes is under a thousand
 * guesses a day from one address.
 */
export const UNLOCK_MAX_PER_IP = 10;

/**
 * Count an attempt and say whether it is over the limit.
 *
 * Counts before it writes and writes nothing when it refuses, exactly as
 * `consumeSignInAttempt` does and for the same reason: a refused attempt that
 * still filled the bucket would let one throttled address hold the gate shut.
 *
 * **Fails open**, with the error logged. These pages describe the system; they
 * hold no customer data, and a database blip locking the team out of its own
 * documentation is the worse of the two failures.
 */
export async function consumeUnlockAttempt(ip: string | null): Promise<boolean> {
  const bucket = `internal-unlock:${hashIdentifier(ip ?? "unknown")}`;
  const since = new Date(Date.now() - UNLOCK_WINDOW_SECONDS * 1000);

  try {
    await db.delete(authRateLimits).where(lt(authRateLimits.createdAt, since));

    const rows = await db
      .select({ attempts: count() })
      .from(authRateLimits)
      .where(and(inArray(authRateLimits.bucket, [bucket]), gt(authRateLimits.createdAt, since)));

    // `>=`, not `>`: the row for this attempt is not written yet, so a bucket
    // already at its ceiling means this attempt is over it.
    if ((rows[0]?.attempts ?? 0) >= UNLOCK_MAX_PER_IP) {
      return false;
    }

    await db.insert(authRateLimits).values([{ bucket }]);
    return true;
  } catch (err) {
    console.error("[internal] unlock rate-limit check failed, allowing:", err);
    return true;
  }
}
