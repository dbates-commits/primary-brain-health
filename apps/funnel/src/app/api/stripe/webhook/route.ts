import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { getStripeWebhookSecret } from "@/lib/stripe/env";
import { registerAndEnrollUserById } from "@/app/assessments/register-and-enroll";
import {
  recordFailedPayment,
  recordRefundedPayment,
  recordSucceededPayment,
} from "@/app/get-started/payment/fulfill";

// Needs Node's crypto + the raw request body for signature verification, and
// must never be cached — every delivery is a distinct event.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook — the authoritative fulfillment path. The client-confirm action
 * (`finalizeAssessmentPayment`) is the fast path for the happy case; this route
 * is the backstop that still records the payment and enrolls the user when the
 * browser never makes it back (tab closed, connection dropped), and the only
 * path that reacts to async lifecycle events (failures, refunds).
 *
 * Response contract Stripe relies on:
 *  - 400 → bad/again-unverifiable signature. Stripe does NOT retry (correct: a
 *    signature won't become valid later).
 *  - 5xx / thrown → Stripe retries with backoff. We use this deliberately when a
 *    handler's work (e.g. enrollment) fails so the event is redelivered; every
 *    write here is idempotent, so a retry is safe.
 *  - 2xx → done.
 */
export async function POST(req: Request): Promise<Response> {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  // Raw, unparsed body — required for signature verification. Do not JSON.parse.
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        await handleSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      }
      case "payment_intent.payment_failed": {
        await recordFailedPayment(event.data.object as Stripe.PaymentIntent);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const intentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : (charge.payment_intent?.id ?? "");
        await recordRefundedPayment(intentId);
        break;
      }
      default: {
        // Unsubscribed event types are acknowledged and ignored.
        break;
      }
    }
  } catch (err) {
    // 500 → Stripe redelivers. Safe because every handler is idempotent.
    console.error(`Stripe webhook handler failed for ${event.type}:`, err);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response(null, { status: 200 });
}

/**
 * Record the succeeded payment, then enroll. Re-fetches the intent with the
 * latest charge expanded so we capture card brand/last4 (the thin event payload
 * doesn't include them), which also re-reads live state as defense in depth.
 *
 * Enrollment runs on every delivery (it's idempotent) rather than only on the
 * first write, so a client that recorded the payment but died before enrolling
 * is still covered. If enrollment errors we throw, so the caller returns 500 and
 * Stripe retries the whole event.
 *
 * Race note: in the common case both this backstop and the client action fire.
 * The client's enroll typically lands 1–2s before this delivery and stores the
 * Linus participant id, so `registerAndEnrollUserById` here skips registration
 * and only reconciles enrollments. A truly simultaneous first-time enroll could
 * still register the subject twice at Linus; fully serializing it needs an
 * advisory lock, which the neon-http driver can't hold across statements (see
 * db/client.ts) — deferred until the app moves to the pooled driver.
 */
async function handleSucceeded(intent: Stripe.PaymentIntent): Promise<void> {
  const full = await getStripe().paymentIntents.retrieve(intent.id, {
    expand: ["latest_charge"],
  });

  const recorded = await recordSucceededPayment(full);
  if (recorded.status === "rejected") {
    // Not our payment / failed re-verification — acknowledge without enrolling.
    console.warn(
      `Stripe webhook: skipped ${full.id} (${recorded.reason})`,
    );
    return;
  }

  const enrolled = await registerAndEnrollUserById(recorded.userId);
  if (enrolled.status === "error") {
    // Payment is safely recorded; surface as a retryable failure so Stripe
    // redelivers and we re-attempt enrollment (idempotent).
    throw new Error(
      `Enrollment failed for user ${recorded.userId} after payment ${full.id}: ${enrolled.message}`,
    );
  }
}
