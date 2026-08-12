"use server";

import { cookies, headers } from "next/headers";
import {
  createCheckoutSessionCore,
  getClientIp,
  hashIp,
  resolveBookingUserId,
  verifyAndRecordCheckout,
} from "@pbh/booking/server";
import type {
  CreateCheckoutResult,
  PaymentFinalizeResult,
} from "@pbh/booking";
import { createSessionForUser } from "@/lib/auth-session";

// User-facing failure copy. Kept deliberately vague — the real cause goes to the
// server logs, never to the customer.
const PAYMENT_UNCONFIRMED = "We couldn't confirm your payment.";
const PAYMENT_UNVERIFIED = "We couldn't verify your payment. Please try again.";
const NO_BOOKING_SESSION =
  "We couldn't find your booking. Please start again from the top.";

function paymentError(message: string): PaymentFinalizeResult {
  return { status: "error", message };
}

/**
 * Start payment for the paying user — delegates to the shared
 * `createCheckoutSessionCore`, passing the request's hashed IP for the
 * `payment_pending` audit entry and the package chosen on the landing card.
 *
 * Who is charged comes from the signed booking cookie, so nobody can open a
 * Checkout Session against another customer's account. `packageKey` is
 * client-supplied and re-resolved server-side, so an unknown or
 * not-yet-purchasable value falls back to the default rather than being trusted.
 */
export async function createAssessmentCheckoutSession(
  packageKey?: string,
): Promise<CreateCheckoutResult> {
  const userId = resolveBookingUserId(await cookies());
  if (!userId) {
    return { status: "error", message: NO_BOOKING_SESSION };
  }
  const ipHash = hashIp(getClientIp(await headers()));
  return createCheckoutSessionCore(userId, { ipHash, packageKey });
}

/**
 * Called from Embedded Checkout's `onComplete`. Verify + record the payment
 * (shared) and sign the customer in. That is the whole job.
 *
 * It deliberately does NOT register or enroll the customer with Linus (pbh-ek8).
 * A Linus outage used to strand a paying customer on the payment step with
 * "Couldn't register with Linus (status 503)" — the charge had gone through and
 * the modal wouldn't advance. Registration is on hold until we settle how
 * clients get registered; `@pbh/linus` and `register-and-enroll.ts` are still on
 * disk, just not called from any request path.
 *
 * The sign-in used to need a signed token handed to a second app on another
 * origin; with one app it is just a cookie we set here, so a customer who comes
 * back later reaches `/welcome` without asking for a magic link.
 *
 * A `success` state sends the customer on to `/welcome`.
 */
export async function finalizeCheckoutSession(
  checkoutSessionId: string,
): Promise<PaymentFinalizeResult> {
  const id = resolveBookingUserId(await cookies());
  const sessionId = checkoutSessionId.trim();
  if (!id || !sessionId) {
    return paymentError(PAYMENT_UNCONFIRMED);
  }

  let verified: boolean;
  try {
    const ipHash = hashIp(getClientIp(await headers()));
    verified = await verifyAndRecordCheckout(id, sessionId, { ipHash });
  } catch (err) {
    console.error("finalizeCheckoutSession failed:", err);
    return paymentError(PAYMENT_UNVERIFIED);
  }
  if (!verified) {
    return paymentError(PAYMENT_UNVERIFIED);
  }

  // Sign them in off the back of the verified payment. Swallowed on failure on
  // purpose: the charge has already gone through, so nothing here may turn a
  // successful payment into an error state. `/welcome` also accepts the booking
  // cookie plus a succeeded payment, so a customer whose session didn't mint
  // still gets back to the confirmation screen.
  try {
    const cookie = await createSessionForUser(id);
    (await cookies()).set(cookie.name, cookie.value, cookie.options);
  } catch (err) {
    console.error("post-payment session mint failed:", err);
  }

  return { status: "success" };
}
