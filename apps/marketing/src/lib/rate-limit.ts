import "server-only";

import { and, count, gt, inArray, lt } from "drizzle-orm";
import { authRateLimits, db } from "@pbh/db";
import { hashIdentifier } from "@pbh/booking/server";

/**
 * Throttle for the magic-link sign-in form.
 *
 * Sign-in answers whether an address has an account (see the disclosure note in
 * `docs/auth.md`), so the form is an enumeration oracle. This is what bounds
 * it: probing is still possible, but at a rate that makes walking a list
 * impractical rather than a single loop.
 *
 * Counted in Postgres rather than Redis on purpose. There is no Redis here, and
 * the argument in `docs/auth.md` for keeping sessions in Neon applies just as
 * well to this: one data posture, no third-party residency to audit, for a
 * table holding a few hashes with a fifteen-minute lifespan. If sign-in volume
 * ever makes the per-attempt write matter, that is the point to reach for a
 * dedicated store — not before.
 */

/** How far back attempts are counted. */
export const SIGNIN_WINDOW_SECONDS = 15 * 60;

/**
 * Per-IP ceiling. The one that bites an enumeration sweep, which by definition
 * uses a different address every time and so never trips the per-email limit.
 * Ten in a quarter-hour is far beyond what a real person does — a customer who
 * mistypes their address twice and re-requests a link is at three.
 */
export const SIGNIN_MAX_PER_IP = 10;

/**
 * Per-address ceiling. Independent of the IP limit: it is what stops one
 * address being mailbombed with sign-in links from a spread of sources.
 */
export const SIGNIN_MAX_PER_EMAIL = 5;

export type SignInAttemptResult =
  | { allowed: true }
  | { allowed: false; limit: "ip" | "email" };

/**
 * Record a sign-in attempt and report whether it is over a limit.
 *
 * Records first, then counts, so the attempt being judged is included — and so
 * that hammering the form keeps the window rolling forward rather than letting
 * an attacker wait out a fixed bucket. Both limits are checked; the IP one is
 * reported first because it is the one an enumeration sweep hits.
 *
 * **Fails open.** If the database is unreachable the attempt is allowed, which
 * sounds worse than it is: sign-in already needs the database to look up the
 * account and mint a session, so a failure here means the request was going to
 * fail regardless. The alternative — failing closed — would turn any database
 * blip into a total sign-in outage, which is a bigger and likelier harm than a
 * brief unthrottled window.
 */
export async function consumeSignInAttempt({
  ip,
  email,
}: {
  ip: string | null;
  email: string;
}): Promise<SignInAttemptResult> {
  const ipBucket = `ip:${hashIdentifier(ip ?? "unknown")}`;
  const emailBucket = `email:${hashIdentifier(email)}`;
  const since = new Date(Date.now() - SIGNIN_WINDOW_SECONDS * 1000);

  try {
    // Sweep before counting. The table is disposable, nothing reads it outside
    // the window, and doing it here keeps it bounded without a scheduled job.
    await db.delete(authRateLimits).where(lt(authRateLimits.createdAt, since));

    await db
      .insert(authRateLimits)
      .values([{ bucket: ipBucket }, { bucket: emailBucket }]);

    const rows = await db
      .select({ bucket: authRateLimits.bucket, attempts: count() })
      .from(authRateLimits)
      .where(
        and(
          inArray(authRateLimits.bucket, [ipBucket, emailBucket]),
          gt(authRateLimits.createdAt, since),
        ),
      )
      .groupBy(authRateLimits.bucket);

    const attemptsFor = (bucket: string) =>
      rows.find((r) => r.bucket === bucket)?.attempts ?? 0;

    if (attemptsFor(ipBucket) > SIGNIN_MAX_PER_IP) {
      return { allowed: false, limit: "ip" };
    }
    if (attemptsFor(emailBucket) > SIGNIN_MAX_PER_EMAIL) {
      return { allowed: false, limit: "email" };
    }
    return { allowed: true };
  } catch (err) {
    console.error("[login] rate-limit check failed, allowing:", err);
    return { allowed: true };
  }
}
