import { handleStripeWebhook } from "@pbh/booking/server";

// Needs Node's crypto + the raw request body for signature verification, and
// must never be cached — every delivery is a distinct event.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook for payments started from the marketing booking modal — the
 * authoritative fulfillment backstop. Shares the exact handler with the funnel
 * (`@pbh/booking/server`): verify signature → record payment → register/enroll
 * (idempotent). Register this endpoint's URL in Stripe with its own signing
 * secret (`STRIPE_WEBHOOK_SECRET`).
 */
export function POST(req: Request): Promise<Response> {
  return handleStripeWebhook(req);
}
