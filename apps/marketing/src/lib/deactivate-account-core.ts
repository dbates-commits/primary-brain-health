import "server-only";

import { and, eq, isNull, sql } from "drizzle-orm";
import { sendAccountDeactivatedEmail } from "@pbh/booking/server";
import {
  bookingEmailVerifications,
  db,
  sessions,
  users,
  verificationTokens,
  writeAuditLog,
} from "@pbh/db";
import type { DeleteAccountState } from "./delete-account-state";

/**
 * File a deletion request for one account (Figma 2060:7053).
 *
 * **Nothing here is erased.** The button says "Request for Deletion" and that is
 * exactly what this does: it stamps `users.deactivated_at`, locks the account
 * out, and leaves the erasure itself to an operator-run routine whose worklist
 * is `deactivated_at IS NOT NULL`. Every value in the row survives.
 *
 * That is not squeamishness, it is what the schema allows. `payments`,
 * `consents`, `linus_enrollments` and `audit_log` all reference `users` with
 * ON DELETE no action, and the first two are append-only while the third is on a
 * six-year HIPAA clock — so `DELETE FROM users` throws today, and anonymizing
 * the row in place would destroy the evidence those tables exist to hold while
 * still leaving their rows behind. A human decides what actually goes.
 *
 * `userId` is resolved by the action wrapper from the Auth.js session, never
 * trusted from the form — the rule `saveProfileAction` states.
 *
 * TODO(linus): this stamps Neon only. Per the Jul 15/16 2026 Linus calls the
 * flow is DEACTIVATE, not delete — their endpoint anonymizes the subject's PII
 * while retaining de-identified assessment results. But `@pbh/linus`'s client
 * has only `registerSubject`, `enrollSubject`, `listEnrollments` and
 * `getReport`; no deactivate endpoint is documented or implemented, so a subject
 * we registered keeps their name, birth date, sex and education on Linus's side
 * after this runs. `users.linus_participant_id` survives precisely so the
 * backfill is possible. The fix is a `deactivateSubject` in `@pbh/linus`'s
 * client plus a call from here — and a decision about what a failed Linus call
 * means for a request Neon has already accepted.
 */
export async function deactivateAccountCore(
  userId: string,
): Promise<DeleteAccountState> {
  let email: string;

  try {
    // The stamp and the idempotency claim in one statement. Neon's HTTP driver
    // gives no interactive transaction (see `packages/db/src/client.ts`), so
    // this is the single atomic point in the whole routine: a double-submit, a
    // replayed POST or a second tab can only win once, and the loser reads back
    // zero rows rather than racing the cleanup below.
    const [claimed] = await db
      .update(users)
      .set({ deactivatedAt: sql`now()` })
      .where(and(eq(users.id, userId), isNull(users.deactivatedAt)))
      .returning({ email: users.email });

    if (!claimed) {
      // Either there is no such row, or the account was already deactivated.
      // Both answer the customer's question the same way, and the second is the
      // common one — so look before calling it a failure.
      const [existing] = await db
        .select({ deactivatedAt: users.deactivatedAt })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!existing) {
        return {
          status: "error",
          message: "We couldn't find your account. Please sign in again.",
        };
      }

      // Already filed. Report success and let the client sign out again; a
      // second audit row would say nothing the first one didn't.
      return { status: "success" };
    }

    email = claimed.email;
  } catch (err) {
    console.error("deactivateAccountCore failed:", err);
    return {
      status: "error",
      message:
        "Something went wrong deleting your account. Please try again.",
    };
  }

  // Past the claim the account is already locked out, so nothing below may turn
  // a request we have accepted into a caller-visible failure. Log loudly and
  // report success either way.
  try {
    // Every device, not just this one. The FK would cascade on a delete, but we
    // are not deleting, so the revocation has to be explicit.
    await db.delete(sessions).where(eq(sessions.userId, userId));

    // Magic links already in flight. `verification_tokens` is Auth.js's table
    // and carries no FK — it is keyed by the address, which is why the UPDATE
    // above returns it.
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, email));

    // Live booking-confirm credentials only. Consumed rows stay: that table is
    // deliberately kept as evidence of when an address was confirmed.
    await db
      .delete(bookingEmailVerifications)
      .where(
        and(
          eq(bookingEmailVerifications.userId, userId),
          isNull(bookingEmailVerifications.consumedAt),
        ),
      );

    // No address in the metadata — the row points at a `users` row that still
    // holds it, and duplicating it here would put PII in an append-only table.
    await writeAuditLog({ eventType: "account_deactivated", userId });

    // Last. Never tell someone their request is filed before it is. This never
    // throws by contract and returns a reason instead.
    const result = await sendAccountDeactivatedEmail(userId);
    if (!result.sent) {
      console.error(
        `[account] deactivation email not sent (${result.reason}) for user ${userId}`,
      );
    }
  } catch (err) {
    console.error("deactivateAccountCore cleanup failed:", err);
  }

  // The address is never logged, in any environment — unlike `profile-core.ts`,
  // which logs field names in production only. The whole point of the request is
  // that this identity stops being ours to hold.
  console.info("[account] deactivated", { userId });

  return { status: "success" };
}
