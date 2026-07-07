"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { writeAuditLog } from "@/db/audit";
import { getClientIp, hashIp } from "@/lib/request-meta";
import { getStripe } from "@/lib/stripe/server";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import {
  ASSESSMENT_CURRENCY,
  ASSESSMENT_PRICE_CENTS,
} from "@/lib/stripe/pricing";
import { completeAssessmentSetup } from "@/app/assessments/actions";
import type { LinusState } from "@/app/assessments/register-and-enroll";
import { recordSucceededPayment } from "./fulfill";

export type CreateCheckoutResult =
  | { status: "ready"; clientSecret: string; sessionId: string }
  | { status: "error"; message: string };

// User-facing failure copy. Kept deliberately vague — the real cause goes to the
// server logs, never to the customer.
const ACCOUNT_NOT_FOUND = "We couldn't find your account.";
const CHECKOUT_START_FAILED = "Couldn't start payment. Please try again.";
const PAYMENT_UNCONFIRMED = "We couldn't confirm your payment.";
const PAYMENT_UNVERIFIED = "We couldn't verify your payment. Please try again.";

function checkoutError(message: string): CreateCheckoutResult {
  return { status: "error", message };
}

function paymentError(message: string): LinusState {
  return { status: "error", email: "", message };
}

/**
 * Start payment for the paying user: create a Stripe **Checkout Session**
 * (`ui_mode: "embedded_page"`) for the fixed assessment price and hand its
 * `client_secret` back to the client, which mounts Stripe's full **Embedded
 * Checkout** form via `EmbeddedCheckoutProvider`/`EmbeddedCheckout`. Stripe now
 * recommends the Checkout Sessions API over raw PaymentIntents; the Session
 * carries the line item, Customer, and metadata in one object.
 *
 * `redirect_on_completion: "never"` keeps the customer on our page after paying:
 * Embedded Checkout fires its `onComplete` callback instead of redirecting, and
 * the client then calls `finalizeCheckoutSession` with the returned `sessionId`
 * (embedded `onComplete` passes no session object of its own). `payment_method_types:
 * ["card"]` keeps the demo to inline (no-redirect) card methods — incl. HSA/FSA.
 */
export async function createAssessmentCheckoutSession(
  userId: string,
): Promise<CreateCheckoutResult> {
  const id = userId.trim();
  if (!id) {
    return checkoutError(ACCOUNT_NOT_FOUND);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (!user) {
    return checkoutError(ACCOUNT_NOT_FOUND);
  }

  // Pinned onto both the Session and the PaymentIntent it creates, so that
  // `finalizeCheckoutSession` and the webhook backstop can each confirm
  // server-side that the payment belongs to this user.
  const metadata = { userId: id, product: "brain-health-assessment" };

  try {
    const stripe = getStripe();
    // Mirror the billing identity we already hold (name, email, ZIP, state) onto
    // a Stripe Customer and attach it, so the charge is grouped under a durable
    // object (and the saved card can be reused downstream later).
    const customerId = await getOrCreateStripeCustomer(user);
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      redirect_on_completion: "never",
      mode: "payment",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: ASSESSMENT_CURRENCY,
            unit_amount: ASSESSMENT_PRICE_CENTS,
            product_data: { name: "Brain health assessment" },
          },
        },
      ],
      payment_intent_data: { receipt_email: user.email, metadata },
      metadata,
    });

    await writeAuditLog({
      eventType: "payment_pending",
      userId: id,
      metadata: {
        checkoutSessionId: session.id,
        amountCents: ASSESSMENT_PRICE_CENTS,
      },
      ipHash: hashIp(getClientIp(await headers())),
    });

    if (!session.client_secret) {
      return checkoutError(CHECKOUT_START_FAILED);
    }
    return {
      status: "ready",
      clientSecret: session.client_secret,
      sessionId: session.id,
    };
  } catch (err) {
    console.error("createAssessmentCheckoutSession failed:", err);
    return checkoutError(CHECKOUT_START_FAILED);
  }
}

/**
 * Re-fetch the Checkout Session from Stripe (never trusting the client's word
 * that it succeeded), resolve its PaymentIntent, confirm the charge belongs to
 * `userId`, and persist it. Returns `true` once the payment is verified and
 * recorded, `false` if anything about it can't be trusted. Amount, currency and
 * status are re-checked inside `recordSucceededPayment`; the insert is idempotent
 * on the payment-intent id, so a double-submit or retry can't duplicate rows.
 */
async function verifyAndRecordPayment(
  userId: string,
  sessionId: string,
): Promise<boolean> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent.latest_charge"],
  });

  const intent = session.payment_intent;
  if (!intent || typeof intent === "string") {
    return false;
  }

  // The confirmed intent must belong to the caller we were handed — guards
  // against a client passing a mismatched userId.
  if (intent.metadata?.userId !== userId) {
    return false;
  }

  const recorded = await recordSucceededPayment(intent, {
    ipHash: hashIp(getClientIp(await headers())),
  });
  return recorded.status !== "rejected";
}

/**
 * Called from Embedded Checkout's `onComplete` (once the payment finishes and
 * the customer stays on our page). Runs in two phases:
 *
 *  1. Verify + record the payment (`verifyAndRecordPayment`). Any failure here —
 *     network, a missing/mismatched intent, a rejected record — is a payment
 *     problem, so we bail before touching enrollment.
 *  2. Hand off to the shared register + enroll flow, which drops the assessment
 *     cookie and returns the success state the client uses to advance to the
 *     confirmation step and link to /assessments.
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
    verified = await verifyAndRecordPayment(id, sessionId);
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
  const formData = new FormData();
  formData.set("userId", id);
  return completeAssessmentSetup({ status: "idle" }, formData);
}
