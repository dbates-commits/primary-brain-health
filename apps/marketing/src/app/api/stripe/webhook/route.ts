import { handleStripeWebhook } from "@pbh/booking/server";

// Needs Node's crypto + the raw request body for signature verification, and
// must never be cached — every delivery is a distinct event.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook — the authoritative fulfillment path, and the ONLY endpoint:
 * verify signature → record payment → register/enroll (idempotent). It backs up
 * the client path (`finalizeCheckoutSession`), which is faster but dies with the
 * browser. Stripe endpoints are account-scoped and every event fans out to all
 * of them, so never add a second one — each delivery would be processed twice.
 */
export function POST(req: Request): Promise<Response> {
  return handleStripeWebhook(req);
}
