import "server-only";

/**
 * Shared, idempotent write path for the Stripe payment lifecycle. Called from
 * BOTH the client-confirm server action (the fast path, in each app's payment
 * action) and the webhook route (`/api/stripe/webhook`, the source-of-truth
 * backstop). Every function here is safe to run more than once for the same
 * PaymentIntent — Stripe redelivers events and the two paths routinely race —
 * so each write is guarded to be a no-op after the first effective one.
 *
 * These functions touch the `payments` mirror + `audit_log`, and hang the two
 * effects that belong to the transition itself off the first effective write:
 * the receipt email and the HubSpot paid flag, both best-effort and neither
 * able to throw. Linus registration/enrollment is the webhook's job alone
 * (pbh-73g) and is NOT done here, so the client-confirm path can never
 * dead-end on a Linus outage.
 */

import { and, eq, ne } from "drizzle-orm";
import type Stripe from "stripe";
import { db, payments, writeAuditLog } from "@pbh/db";
import { getAssessmentCatalogEntry } from "@pbh/payments";
import { getPackage, resolvePackageKey } from "../packages";
import { markHubSpotContactPaid } from "./hubspot-contact";
import {
  sendPaymentFailedEmail,
  sendPaymentReceiptEmail,
  sendPaymentRefundedEmail,
} from "./send-email";

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
  // Which package this charge was for, taken from the intent's own metadata —
  // set server-side when the Session was created, so it arrives back signed by
  // Stripe rather than re-supplied by a client. An intent predating packages
  // (or carrying an unknown key) resolves to the default, which is the price
  // those charges were made against.
  const packageKey = resolvePackageKey(intent.metadata?.packageKey);
  const pkg = getPackage(packageKey)!;

  const catalog = await getAssessmentCatalogEntry(pkg.priceEnvVar);
  if (
    intent.amount !== catalog.amountCents ||
    intent.currency !== catalog.currency
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
      packageKey,
      status: "succeeded",
      cardBrand: card?.brand ?? null,
      cardLast4: card?.last4 ?? null,
      cardExpMonth: card?.exp_month ?? null,
      cardExpYear: card?.exp_year ?? null,
      succeededAt: new Date(),
    })
    .onConflictDoUpdate({
      target: payments.stripePaymentIntentId,
      set: {
        status: "succeeded",
        amountCents: intent.amount,
        currency: intent.currency,
        packageKey,
        cardBrand: card?.brand ?? null,
        cardLast4: card?.last4 ?? null,
        cardExpMonth: card?.exp_month ?? null,
        cardExpYear: card?.exp_year ?? null,
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
    // firstWrite is the exactly-once signal across the racing client/webhook
    // paths, so the receipt goes out here (never throws — see send-email.ts).
    await sendPaymentReceiptEmail(userId, {
      amountCents: intent.amount,
      currency: intent.currency,
      cardBrand: card?.brand ?? null,
      cardLast4: card?.last4 ?? null,
    });
    // Same once-only gate: the contact is flagged as paying on the transition,
    // so `paid_on_date` is the date of the payment rather than of whichever
    // redelivery ran last. Never throws — see hubspot-contact.ts.
    await markHubSpotContactPaid(userId, new Date());
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

  const card = cardFromIntent(intent);

  const written = await db
    .insert(payments)
    .values({
      userId,
      stripePaymentIntentId: intent.id,
      amountCents: intent.amount,
      currency: intent.currency,
      status: "failed",
      cardBrand: card?.brand ?? null,
      cardLast4: card?.last4 ?? null,
    })
    // No `pending` row is ever written (session creation only audit-logs), so
    // any existing row here is already terminal (succeeded/failed/refunded).
    // Gating on `status = 'pending'` therefore makes every conflict a no-op — we
    // never clobber a terminal row, and a redelivered failed event never re-audits.
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
    // The decline email goes only to someone still stuck. Each mount of the
    // payment step mints a fresh Session, so a soft decline retried
    // successfully leaves two intents: this one, failed, and a succeeded one.
    // Without this check that customer gets a receipt and a "we're holding your
    // assessment" notice for the same booking (pbh-is2). Read after the write,
    // so a success recorded by either racing path is already visible.
    const paid = await db
      .select({ id: payments.id })
      .from(payments)
      .where(and(eq(payments.userId, userId), eq(payments.status, "succeeded")))
      .limit(1);
    if (paid.length > 0) {
      return { status: "recorded", userId, firstWrite };
    }
    // firstWrite is the exactly-once signal, so the notice goes out here
    // (never throws — see send-email.ts).
    await sendPaymentFailedEmail(userId, {
      amountCents: intent.amount,
      currency: intent.currency,
      cardBrand: card?.brand ?? null,
      cardLast4: card?.last4 ?? null,
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
    .returning({
      id: payments.id,
      userId: payments.userId,
      amountCents: payments.amountCents,
      currency: payments.currency,
      cardBrand: payments.cardBrand,
      cardLast4: payments.cardLast4,
    });

  if (written.length === 0) {
    // No matching row (unknown intent) or already refunded → nothing to do.
    return { status: "recorded", userId: "", firstWrite: false };
  }

  const refunded = written[0];
  const userId = refunded.userId;
  await writeAuditLog({
    eventType: "payment_refunded",
    userId,
    metadata: { paymentIntentId },
  });

  // First transition to refunded (the update above is the once-only gate).
  await sendPaymentRefundedEmail(userId, {
    amountCents: refunded.amountCents,
    currency: refunded.currency,
    cardBrand: refunded.cardBrand,
    cardLast4: refunded.cardLast4,
  });

  return { status: "recorded", userId, firstWrite: true };
}
