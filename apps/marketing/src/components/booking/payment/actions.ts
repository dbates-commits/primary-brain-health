"use server";

import { headers } from "next/headers";
import {
  createHandoffForLatestPayment,
  createCheckoutSessionCore,
  getClientIp,
  hashIp,
  registerAndEnrollUserById,
  verifyAndRecordCheckout,
  type LinusState,
} from "@pbh/booking/server";
import type { CreateCheckoutResult } from "@pbh/booking";

// User-facing failure copy. Kept deliberately vague — the real cause goes to the
// server logs, never to the customer.
const PAYMENT_UNCONFIRMED = "We couldn't confirm your payment.";
const PAYMENT_UNVERIFIED = "We couldn't verify your payment. Please try again.";

function paymentError(message: string): LinusState {
  return { status: "error", email: "", message };
}

/**
 * Start payment for the paying user — delegates to the shared
 * `createCheckoutSessionCore`, passing the request's hashed IP for the
 * `payment_pending` audit entry and the package chosen on the landing card.
 *
 * `packageKey` is client-supplied and re-resolved server-side, so an unknown or
 * not-yet-purchasable value falls back to the default rather than being trusted.
 */
export async function createAssessmentCheckoutSession(
  userId: string,
  packageKey?: string,
): Promise<CreateCheckoutResult> {
  const ipHash = hashIp(getClientIp(await headers()));
  return createCheckoutSessionCore(userId, { ipHash, packageKey });
}

/**
 * Called from Embedded Checkout's `onComplete`. Verify + record the payment
 * (shared), then register + enroll the user in Linus. Unlike the funnel, the
 * marketing app sets no session cookie — the paid + enrolled user is handed to
 * the funnel's `/login` (see `DoneStep`), which drops the assessment cookie and
 * lands on `/assessments`. That `/login` is the seam Clerk replaces later.
 *
 * A `success` state advances the modal to the confirmation step; enrollment
 * failures surface inline (the charge stands and the webhook backstop retries).
 */
export async function finalizeCheckoutSession(
  userId: string,
  checkoutSessionId: string,
): Promise<LinusState> {
  const id = userId.trim();
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

  // Deliberately outside the try above so an enrollment failure surfaces as its
  // own state, not a payment error: the charge stands and the webhook backstop
  // retries enrollment.
  return registerAndEnrollUserById(id);
}

/**
 * Mint the post-payment sign-in link, so the customer lands on `/assessments`
 * already authenticated instead of requesting a magic link.
 *
 * Marketing cannot set the funnel's session cookie (different origins), so this
 * hands the funnel a short-lived, single-use token bound to the succeeded
 * payment; the funnel verifies it and mints the real session.
 *
 * Returns null when there's nothing to hand off — the caller falls back to
 * `/login`, which always works.
 */
export async function createAssessmentHandoffUrl(
  userId: string,
): Promise<string | null> {
  const id = userId.trim();
  if (!id) {
    return null;
  }
  try {
    const token = await createHandoffForLatestPayment(id);
    if (!token) {
      return null;
    }
    const base = process.env.NEXT_PUBLIC_FUNNEL_URL ?? "";
    return `${base}/api/auth/handoff?token=${encodeURIComponent(token)}`;
  } catch (err) {
    // A missing AUTH_HANDOFF_SECRET throws here. That must not strand a paid
    // customer on a broken confirmation screen — fall back to the magic link.
    console.error("createAssessmentHandoffUrl failed:", err);
    return null;
  }
}
