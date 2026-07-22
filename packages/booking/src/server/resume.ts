import "server-only";

import { and, eq } from "drizzle-orm";
import { consents, db, payments, users } from "@pbh/db";

/**
 * Where a returning customer picks the booking back up. Mirrors the modal's own
 * step names so the client can open straight at the returned value.
 */
export type BookingResumeStep =
  | "confirm"
  | "details"
  | "consent"
  | "payment"
  | "done";

export interface BookingResumeState {
  userId: string;
  firstName: string;
  /** Decides how the details step is worded and what it asks. */
  patientIdentification: string;
  step: BookingResumeStep;
}

/**
 * Resolve how far a booking got, from what's actually been persisted — never
 * from anything the client claims. Each step is identified by the write it
 * makes, so a half-finished step reads as not-done:
 *
 *  - confirm  → `users.emailVerified` is stamped
 *  - details  → `users.dateOfBirth` is set (required by the step, and by Linus)
 *  - consent  → a `consents` row exists
 *  - payment  → a `payments` row reached `succeeded`
 *
 * Returns null when the user is gone, so a stale cookie can't resume a deleted
 * account.
 */
export async function resolveBookingResumeState(
  userId: string,
): Promise<BookingResumeState | null> {
  const [user] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      patientIdentification: users.patientIdentification,
      emailVerified: users.emailVerified,
      dateOfBirth: users.dateOfBirth,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  const base = {
    userId: user.id,
    firstName: user.firstName,
    patientIdentification: user.patientIdentification ?? "Self",
  };

  if (!user.emailVerified) {
    return { ...base, step: "confirm" };
  }
  if (!user.dateOfBirth) {
    return { ...base, step: "details" };
  }

  const [consent] = await db
    .select({ id: consents.id })
    .from(consents)
    .where(eq(consents.userId, userId))
    .limit(1);
  if (!consent) {
    return { ...base, step: "consent" };
  }

  const [paid] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.userId, userId), eq(payments.status, "succeeded")))
    .limit(1);
  if (!paid) {
    return { ...base, step: "payment" };
  }

  return { ...base, step: "done" };
}
