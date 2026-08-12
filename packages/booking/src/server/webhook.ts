import "server-only";

import type Stripe from "stripe";
import { getStripe, getStripeWebhookSecret } from "@pbh/payments";
import {
  recordFailedPayment,
  recordRefundedPayment,
  recordSucceededPayment,
} from "./fulfill";

/**
 * Stripe webhook handler — the authoritative fulfillment path, mounted once, at
 * `/api/stripe/webhook`. Stripe endpoints are account-scoped, so that single
 * endpoint receives every event for the account; fulfillment resolves the user
 * from `intent.metadata.userId`.
 *
 * The client-confirm action (the booking flow's finalize) is the fast path for
 * the happy case; this is the backstop that still records the payment when the
 * browser never makes it back (tab closed, connection dropped), and the only
 * path that reacts to async lifecycle events (failures, refunds).
 *
 * Response contract Stripe relies on:
 *  - 400 → bad/again-unverifiable signature. Stripe does NOT retry (correct: a
 *    signature won't become valid later).
 *  - 5xx / thrown → Stripe retries with backoff, which is what an unexpected
 *    handler failure gets; every write here is idempotent, so a retry is safe.
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
 * Record the succeeded payment. Re-fetches the intent with the latest charge
 * expanded so we capture card brand/last4 (the thin event payload doesn't
 * include them), which also re-reads live state as defense in depth.
 *
 * Recording the payment is now the whole job: this used to also register and
 * enroll the payer with Linus and throw on failure so Stripe redelivered, which
 * turned a Linus outage into a stream of 500s here (pbh-ek8). Registration is on
 * hold until we settle how clients get registered.
 */
async function handleSucceeded(intent: Stripe.PaymentIntent): Promise<void> {
  const full = await getStripe().paymentIntents.retrieve(intent.id, {
    expand: ["latest_charge"],
  });

  const recorded = await recordSucceededPayment(full);
  if (recorded.status === "rejected") {
    // Not our payment / failed re-verification — acknowledge and move on.
    console.warn(`Stripe webhook: skipped ${full.id} (${recorded.reason})`);
  }
}
