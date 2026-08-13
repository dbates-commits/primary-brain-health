import "server-only";

import { and, eq } from "drizzle-orm";
import { consents, db, payments, users } from "@pbh/db";
import { resolvePackageKey, type PackageKey } from "../packages";

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
  /**
   * Account holder's name, and the patient's if the details step already
   * captured one. The client prefills the details step with
   * `patientFirstName ?? firstName`, so a customer who typed someone else's
   * name sees it again rather than their own.
   */
  firstName: string;
  lastName: string;
  patientFirstName: string | null;
  patientLastName: string | null;
  /** The package chosen at signup, so payment charges what they picked. */
  packageKey: PackageKey;
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
      lastName: users.lastName,
      patientFirstName: users.patientFirstName,
      patientLastName: users.patientLastName,
      emailVerified: users.emailVerified,
      dateOfBirth: users.dateOfBirth,
      selectedPackageKey: users.selectedPackageKey,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  // No `userId` in the returned state: this is read by the client, and the id
  // stays server-side in the booking cookie (see `booking-session.ts`).
  const base = {
    firstName: user.firstName,
    lastName: user.lastName,
    patientFirstName: user.patientFirstName,
    patientLastName: user.patientLastName,
    packageKey: resolvePackageKey(user.selectedPackageKey),
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
