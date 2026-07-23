"use server";

import { headers } from "next/headers";
import {
  createCheckoutSessionCore,
  getClientIp,
  hashIp,
  registerAndEnrollUserById,
  verifyAndRecordCheckout,
  type LinusState,
} from "@pbh/booking/server";
import type { CreateCheckoutResult } from "@pbh/booking";
import { isTrack, type Track } from "@pbh/copy";

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
 * `payment_pending` audit entry.
 *
 * `track` arrives from the client, so it's re-validated here at the server-action
 * boundary. It isn't a privilege: the track picks the Stripe price *and* the
 * product, and fulfillment records the track that was actually charged — so
 * sending a different one buys that product at that product's price, which is
 * just what choosing it on the page does.
 */
export async function createAssessmentCheckoutSession(
  userId: string,
  track: Track,
): Promise<CreateCheckoutResult> {
  if (!isTrack(track)) {
    return { status: "error", message: PAYMENT_UNCONFIRMED };
  }
  const ipHash = hashIp(getClientIp(await headers()));
  return createCheckoutSessionCore(userId, { ipHash, track });
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
