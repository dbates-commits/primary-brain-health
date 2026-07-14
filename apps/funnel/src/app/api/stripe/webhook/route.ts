import { handleStripeWebhook } from "@pbh/booking/server";

// Needs Node's crypto + the raw request body for signature verification, and
// must never be cached — every delivery is a distinct event.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook — the authoritative fulfillment path, and the ONLY endpoint:
 * verify signature → record payment → register/enroll (idempotent). Stripe
 * endpoints are account-scoped, so this receives events for payments started on
 * the marketing site too. Do not add a second endpoint in another app — Stripe
 * fans every event out to all of them, and each delivery would be processed twice.
 */
export function POST(req: Request): Promise<Response> {
  return handleStripeWebhook(req);
}
