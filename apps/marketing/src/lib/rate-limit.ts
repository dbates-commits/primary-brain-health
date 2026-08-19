import "server-only";

import { and, count, gt, inArray, lt } from "drizzle-orm";
import { authRateLimits, db, writeAuditLog } from "@pbh/db";
import { hashIdentifier, hashIp } from "@pbh/booking/server";

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
 *
 * Five, not ten: ten in a quarter-hour is ~960 attempts a day from one address,
 * which is a loose bound on the thing this exists to stop. Five still clears
 * what a real person does — a customer who mistypes their address twice and
 * re-requests a link is at three.
 *
 * The floor on lowering it further is shared IPs. An office or a household
 * behind one NAT can genuinely have two or three people signing in in the same
 * quarter-hour, and they all count against this single bucket.
 */
const DEFAULT_MAX_PER_IP = 5;

/**
 * Per-address ceiling. Independent of the IP limit: it is what stops one
 * address being mailbombed with sign-in links from a spread of sources, which
 * the per-IP limit never sees.
 */
const DEFAULT_MAX_PER_EMAIL = 5;

/**
 * Read a ceiling from the environment, falling back to the shipped default.
 *
 * Every attempt is counted, successful sign-ins included — a magic link that
 * actually sends costs a slot exactly like a probe does. That is right for
 * production and miserable for testing: six login/logout rounds in a
 * quarter-hour and you are locked out of your own work. So the ceilings can be
 * raised locally and on previews.
 *
 * **The override is ignored in production.** A limit that can be relaxed by
 * setting a variable is a limit that will eventually be relaxed by accident,
 * and this one is the bound on account enumeration. `VERCEL_ENV` is the same
 * production signal used by `robots.ts` and `@pbh/linus`.
 */
function readLimit(name: string, fallback: number): number {
  if (process.env.VERCEL_ENV === "production") {
    return fallback;
  }
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    console.warn(
      `[login] ignoring ${name}="${raw}" — expected a positive integer.`,
    );
    return fallback;
  }
  return parsed;
}

export const SIGNIN_MAX_PER_IP = readLimit(
  "SIGNIN_MAX_PER_IP",
  DEFAULT_MAX_PER_IP,
);
export const SIGNIN_MAX_PER_EMAIL = readLimit(
  "SIGNIN_MAX_PER_EMAIL",
  DEFAULT_MAX_PER_EMAIL,
);

export type SignInAttemptResult =
  | { allowed: true }
  | { allowed: false; limit: "ip" | "email" };

/**
 * Record a sign-in attempt and report whether it is over a limit.
 *
 * **Counts before it writes, and writes nothing when it refuses.** The obvious
 * ordering — record, then count, so the attempt being judged is included and
 * hammering the form keeps the window rolling forward — hands an attacker a
 * permanent lockout: a refused attempt would still land a row in the *email*
 * bucket, so one already-throttled IP could keep any address pinned above its
 * ceiling forever, at a cost of one free request a minute, and the victim could
 * never obtain a sign-in link from anywhere. Refusing without writing means the
 * only thing that fills a bucket is an attempt that was actually spent, so a
 * lockout costs the attacker real budget from a real address and expires with
 * the window.
 *
 * The IP ceiling is checked first, and short-circuits: an IP that is already
 * over its own limit never gets to touch the email bucket at all.
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

    // `>=`, not `>`: the row for this attempt has not been written yet, so a
    // bucket already sitting at its ceiling means this one is over it.
    if (attemptsFor(ipBucket) >= SIGNIN_MAX_PER_IP) {
      return { allowed: false, limit: "ip" };
    }
    if (attemptsFor(emailBucket) >= SIGNIN_MAX_PER_EMAIL) {
      return { allowed: false, limit: "email" };
    }

    await db
      .insert(authRateLimits)
      .values([{ bucket: ipBucket }, { bucket: emailBucket }]);

    return { allowed: true };
  } catch (err) {
    console.error("[login] rate-limit check failed, allowing:", err);
    return { allowed: true };
  }
}

/**
 * Record that a sign-in attempt was refused.
 *
 * The `auth_rate_limits` rows are disposable — swept the moment they age out —
 * so the audit row is the only lasting trace that a limit fired. Shared by both
 * callers of {@link consumeSignInAttempt} (the login server action and the
 * Auth.js sign-in route) so a refusal looks the same in the trail whichever
 * door it came through.
 *
 * Never throws: a failed audit write must not turn a throttled request into a
 * 500, which would itself be a signal.
 */
export async function auditThrottledSignIn(
  ip: string | null,
  limit: "ip" | "email",
): Promise<void> {
  try {
    await writeAuditLog({
      eventType: "signin_rate_limited",
      ipHash: hashIp(ip),
      metadata: { limit },
    });
  } catch (err) {
    console.error("[login] audit write for throttled sign-in failed:", err);
  }
}
