import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import { db, users, writeAuditLog } from "@pbh/db";
import { sendWelcomeEmail } from "./send-email";

/**
 * Stamp `users.emailVerified` once the address has been proven, and do the two
 * things that hang off that transition: the audit row and the welcome email.
 *
 * Proof used to come from our own one-time link (`/booking/confirm`). It now
 * comes from Auth0 — the customer entered a code Auth0 emailed them, so Auth0
 * asserts `email_verified` and this is called from the sign-in event. See the
 * "Auth0" section of `docs/auth.md`.
 *
 * **Idempotent, and the return value is why.** The stamp only lands when the
 * column is still null, and the caller fires on *every* Auth0 sign-in, not just
 * the first. Returning whether the row actually moved is what stops a returning
 * customer being sent a welcome email on each login.
 */
export async function markEmailVerified(userId: string): Promise<boolean> {
  const stamped = await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(and(eq(users.id, userId), isNull(users.emailVerified)))
    .returning({ id: users.id });

  if (stamped.length === 0) {
    return false;
  }

  try {
    await writeAuditLog({ eventType: "email_verified", userId });
  } catch (err) {
    console.error("[auth] audit write for email_verified failed:", err);
  }

  // Best-effort, like every other send in this flow: a bounced welcome must not
  // fail the sign-in that triggered it.
  await sendWelcomeEmail(userId);

  return true;
}
