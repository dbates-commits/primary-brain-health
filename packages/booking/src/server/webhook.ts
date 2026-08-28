import "server-only";

import type Stripe from "stripe";
import { getStripe, getStripeWebhookSecret } from "@pbh/payments";
import {
  recordFailedPayment,
  recordRefundedPayment,
  recordSucceededPayment,
} from "./fulfill";
import { registerAndEnrollUserById } from "./register-and-enroll";

/**
 * Stripe webhook handler — the authoritative fulfillment path, mounted once, at
 * `/api/stripe/webhook`. Stripe endpoints are account-scoped, so that single
 * endpoint receives every event for the account; fulfillment resolves the user
 * from `intent.metadata.userId`.
 *
 * The client-confirm action (the booking flow's finalize) is the fast path for
 * the happy case; this is the backstop that still records the payment when the
 * browser never makes it back (tab closed, connection dropped), the only path
 * that reacts to async lifecycle events (failures, refunds), and the only place
 * anything registers with Linus (pbh-73g).
 *
 * Response contract Stripe relies on:
 *  - 400 → bad/again-unverifiable signature. Stripe does NOT retry (correct: a
 *    signature won't become valid later).
 *  - 5xx / thrown → Stripe retries with backoff. An unexpected handler failure
 *    gets this, and so does a *transient* Linus failure, deliberately: the
 *    redelivery is how registration recovers. Every write here is idempotent,
 *    so a retry is safe.
 *  - 2xx → done.
 *
 * The route that calls this must run on the Node.js runtime and be non-cached
 * (`export const runtime = "nodejs"` / `dynamic = "force-dynamic"`), since we need
 * Node's crypto + the raw request body for signature verification.
 */
export async function handleStripeWebhook(req: Request): Promise<Response> {
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
        await handleFailed(event.data.object as Stripe.PaymentIntent);
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
 * Record the succeeded payment, then register + enroll the payer with Linus.
 * Re-fetches the intent with the latest charge expanded so we capture card
 * brand/last4 (the thin event payload doesn't include them), which also re-reads
 * live state as defense in depth.
 *
 * Registration lives here and nowhere else. Doing it inline on the customer's
 * finalize is what dead-ended paying customers on the payment step during a
 * Linus outage (pbh-ek8); out here the customer is already on /welcome and a
 * retry costs them nothing.
 *
 * It runs on every delivery rather than only the first write — it is idempotent
 * (the participant id and enrollment rows are stored, and a registration claim
 * elects a single registrar), so a delivery that recorded the payment but died
 * before registering is still covered.
 *
 * Failure handling is split on `retryable` so an outage recovers but a subject
 * that can never be built doesn't burn three days of redeliveries:
 *  - transient (Linus 5xx/429, DB, a concurrent registration still in flight) →
 *    throw, so the caller 500s and Stripe redelivers.
 *  - permanent (no date of birth, no patient name, a Linus 4xx) → log and
 *    acknowledge. The payment stands; the account needs a human.
 */
async function handleSucceeded(intent: Stripe.PaymentIntent): Promise<void> {
  const full = await getStripe().paymentIntents.retrieve(intent.id, {
    expand: ["latest_charge"],
  });

  const recorded = await recordSucceededPayment(full);
  if (recorded.status === "rejected") {
    // Not our payment / failed re-verification — acknowledge without registering.
    console.warn(`Stripe webhook: skipped ${full.id} (${recorded.reason})`);
    return;
  }

  // retryOnContention: concurrent deliveries of the same event can race on a
  // first-time registration. The DB claim guarantees only one of them calls
  // Linus; the loser fails here so Stripe redelivers and it picks up the stored
  // participant id, rather than silently skipping enrollment.
  const enrolled = await registerAndEnrollUserById(recorded.userId, {
    retryOnContention: true,
  });
  if (enrolled.status === "error") {
    const context = `user ${recorded.userId} after payment ${full.id}: ${enrolled.message}`;
    if (!enrolled.retryable) {
      // Nothing a redelivery would fix. The payment is safely recorded, so
      // acknowledge and leave the account for a human to sort out.
      console.error(`Linus registration permanently failed for ${context}`);
      return;
    }
    // Surface as a retryable failure so Stripe redelivers and we re-attempt.
    throw new Error(`Linus registration failed for ${context}`);
  }
}

/**
 * Record the declined payment. Re-fetches with the latest charge expanded for
 * the same reason `handleSucceeded` does: the event payload carries
 * `latest_charge` as a bare id, so the brand/last4 that name the card in the
 * decline email and on the `payments` row are not in it (pbh-is2).
 *
 * Unlike the succeeded path there is nothing to register, and a failure to
 * re-fetch should not cost us the record — the thin intent still has the id,
 * amount and error, which is everything except the card.
 */
async function handleFailed(intent: Stripe.PaymentIntent): Promise<void> {
  let full = intent;
  try {
    full = await getStripe().paymentIntents.retrieve(intent.id, {
      expand: ["latest_charge"],
    });
  } catch (err) {
    console.error(`Stripe webhook: could not expand ${intent.id}:`, err);
  }
  await recordFailedPayment(full);
}
