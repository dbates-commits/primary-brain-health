/**
 * Shared, idempotent write path for the Stripe payment lifecycle. Called from
 * BOTH the client-confirm server action (`finalizeAssessmentPayment`, the fast
 * path) and the webhook route (`/api/stripe/webhook`, the source-of-truth
 * backstop). Every function here is safe to run more than once for the same
 * PaymentIntent — Stripe redelivers events and the two paths routinely race —
 * so each write is guarded to be a no-op after the first effective one.
 *
 * These functions ONLY touch the `payments` mirror + `audit_log`. Enrollment
 * (the Linus register/enroll handoff) is deliberately left to the callers so it
 * runs exactly once per path (the client action delegates to
 * `completeAssessmentSetup`; the webhook calls `registerAndEnrollUserById`).
 */

import { and, eq, ne } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db/client";
import { payments } from "@/db/schema";
import { writeAuditLog } from "@/db/audit";
import {
  ASSESSMENT_CURRENCY,
  ASSESSMENT_PRICE_CENTS,
} from "@/lib/stripe/pricing";

export type RecordResult =
  | { status: "recorded"; userId: string; firstWrite: boolean }
  | { status: "rejected"; reason: string };

/** Non-sensitive card fields off the expanded latest charge (never the PAN/CVV). */
function cardFromIntent(intent: Stripe.PaymentIntent) {
  const charge =
    intent.latest_charge && typeof intent.latest_charge !== "string"
      ? intent.latest_charge
      : null;
  return charge?.payment_method_details?.card ?? null;
}

/**
 * Persist a succeeded PaymentIntent as a `payments` row and, on the first
 * effective write, an audit entry. Re-verifies status/amount/currency against
 * our fixed price so a signed-but-stale or tampered event can't fulfill the
 * wrong thing. `firstWrite` is true only when this call actually transitioned
 * the row to succeeded — the caller uses it to enroll/retry, and it gates the
 * audit write so redelivered events don't double-log.
 *
 * The upsert also promotes a prior `failed` row for the same intent (a declined
 * card retried on the same PaymentIntent) to `succeeded`; `setWhere` makes an
 * already-succeeded row a genuine no-op (empty RETURNING → no audit).
 */
export async function recordSucceededPayment(
  intent: Stripe.PaymentIntent,
  opts: { ipHash?: string | null } = {},
): Promise<RecordResult> {
  const userId = intent.metadata?.userId?.trim() ?? "";
  if (!userId) {
    return { status: "rejected", reason: "intent has no userId metadata" };
  }
  if (intent.status !== "succeeded") {
    return { status: "rejected", reason: `intent status is ${intent.status}` };
  }
  if (
    intent.amount !== ASSESSMENT_PRICE_CENTS ||
    intent.currency !== ASSESSMENT_CURRENCY
  ) {
    return { status: "rejected", reason: "amount/currency mismatch" };
  }

  const card = cardFromIntent(intent);

  const written = await db
    .insert(payments)
    .values({
      userId,
      stripePaymentIntentId: intent.id,
      amountCents: intent.amount,
      currency: intent.currency,
      status: "succeeded",
      cardBrand: card?.brand ?? null,
      cardLast4: card?.last4 ?? null,
      succeededAt: new Date(),
    })
    .onConflictDoUpdate({
      target: payments.stripePaymentIntentId,
      set: {
        status: "succeeded",
        amountCents: intent.amount,
        currency: intent.currency,
        cardBrand: card?.brand ?? null,
        cardLast4: card?.last4 ?? null,
        succeededAt: new Date(),
      },
      // Skip (and return no row) if it's already succeeded → once-only audit.
      setWhere: ne(payments.status, "succeeded"),
    })
    .returning({ id: payments.id });

  const firstWrite = written.length > 0;
  if (firstWrite) {
    await writeAuditLog({
      eventType: "payment_succeeded",
      userId,
      metadata: { paymentIntentId: intent.id, amountCents: intent.amount },
      ipHash: opts.ipHash ?? null,
    });
  }

  return { status: "recorded", userId, firstWrite };
}

/**
 * Record a failed PaymentIntent. Inserts a `failed` row (or leaves an existing
 * non-failed row untouched — we never clobber a `succeeded`/`refunded` row that
 * a later event produced for the same intent). Audit is written only on the
 * first transition to failed.
 */
export async function recordFailedPayment(
  intent: Stripe.PaymentIntent,
): Promise<RecordResult> {
  const userId = intent.metadata?.userId?.trim() ?? "";
  if (!userId) {
    return { status: "rejected", reason: "intent has no userId metadata" };
  }

  const written = await db
    .insert(payments)
    .values({
      userId,
      stripePaymentIntentId: intent.id,
      amountCents: intent.amount,
      currency: intent.currency,
      status: "failed",
    })
    // Only an existing NON-failed, non-terminal row should flip to failed; a row
    // that's already failed/succeeded/refunded stays as-is (no-op, no audit).
    .onConflictDoUpdate({
      target: payments.stripePaymentIntentId,
      set: { status: "failed" },
      setWhere: eq(payments.status, "pending"),
    })
    .returning({ id: payments.id });

  const firstWrite = written.length > 0;
  if (firstWrite) {
    await writeAuditLog({
      eventType: "payment_failed",
      userId,
      metadata: {
        paymentIntentId: intent.id,
        amountCents: intent.amount,
        reason: intent.last_payment_error?.message ?? null,
      },
    });
  }

  return { status: "recorded", userId, firstWrite };
}

/**
 * Record a refund against the payment for `paymentIntentId`. Idempotent: only a
 * not-yet-refunded row flips to `refunded` (and only then is the audit written).
 * The userId comes off the stored row, since a Charge event may not carry it.
 */
export async function recordRefundedPayment(
  paymentIntentId: string,
): Promise<RecordResult> {
  if (!paymentIntentId) {
    return { status: "rejected", reason: "no paymentIntentId on charge" };
  }

  const written = await db
    .update(payments)
    .set({ status: "refunded" })
    .where(
      and(
        eq(payments.stripePaymentIntentId, paymentIntentId),
        ne(payments.status, "refunded"),
      ),
    )
    .returning({ id: payments.id, userId: payments.userId });

  if (written.length === 0) {
    // No matching row (unknown intent) or already refunded → nothing to do.
    return { status: "recorded", userId: "", firstWrite: false };
  }

  const userId = written[0].userId;
  await writeAuditLog({
    eventType: "payment_refunded",
    userId,
    metadata: { paymentIntentId },
  });

  return { status: "recorded", userId, firstWrite: true };
}
