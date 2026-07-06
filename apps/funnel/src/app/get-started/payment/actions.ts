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
  | { status: "ready"; clientSecret: string }
  | { status: "error"; message: string };

/**
 * Start payment for the paying user: create a Stripe **Checkout Session**
 * (`ui_mode: "elements"`) for the fixed assessment price and hand its
 * `client_secret` back to the client, which initializes the Payment Element via
 * `CheckoutElementsProvider` and confirms with `checkout.confirm`. Stripe now
 * recommends the Checkout Sessions API over raw PaymentIntents; the Session
 * carries the line item, Customer, and metadata in one object.
 *
 * We pin the user id in `payment_intent_data.metadata` (which carries onto the
 * PaymentIntent the Session creates) so both `finalizeCheckoutSession` and the
 * webhook backstop can verify server-side that the payment belongs to this user.
 *
 * `payment_method_types: ["card"]` keeps the demo to inline (no-redirect) card
 * methods — incl. HSA/FSA — so the customer never actually leaves the page. The
 * client still passes a `returnUrl` to `checkout.confirm` (the SDK requires one),
 * but it's only used as a fallback if a redirect-based method is ever enabled.
 */
export async function createAssessmentCheckoutSession(
  userId: string,
): Promise<CreateCheckoutResult> {
  const id = userId.trim();
  if (!id) {
    return { status: "error", message: "We couldn't find your account." };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (!user) {
    return { status: "error", message: "We couldn't find your account." };
  }

  try {
    const stripe = getStripe();
    // Mirror the billing identity we already hold (name, email, ZIP, state) onto
    // a Stripe Customer and attach it, so the charge is grouped under a durable
    // object (and the saved card can be reused downstream later).
    const customerId = await getOrCreateStripeCustomer(user);
    const session = await stripe.checkout.sessions.create({
      ui_mode: "elements",
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
      payment_intent_data: {
        receipt_email: user.email,
        metadata: { userId: id, product: "brain-health-assessment" },
      },
      metadata: { userId: id, product: "brain-health-assessment" },
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
      return { status: "error", message: "Couldn't start payment. Please try again." };
    }
    return { status: "ready", clientSecret: session.client_secret };
  } catch (err) {
    console.error("createAssessmentCheckoutSession failed:", err);
    return { status: "error", message: "Couldn't start payment. Please try again." };
  }
}

/**
 * Called after the client confirms the Payment Element (`checkout.confirm`). We
 * re-fetch the Checkout Session from Stripe (never trusting the client's word
 * that it succeeded), resolve its PaymentIntent, assert it succeeded for the
 * right user / amount / currency, persist a `payments` row + audit entry, then
 * hand off to the existing register-and-enroll flow (which drops the assessment
 * cookie and returns the success state — the client then advances to the
 * confirmation step and links to /assessments).
 *
 * The user id is read from the intent metadata and cross-checked against the
 * caller we were handed. The `payments` insert is idempotent on the unique
 * payment-intent id, so a double-submit or retry can't create duplicate rows.
 * Enrollment failures after a successful charge come back as an error state —
 * the charge stands and the webhook backstop (pbh-bws.28) retries enrollment.
 */
export async function finalizeCheckoutSession(
  userId: string,
  checkoutSessionId: string,
): Promise<LinusState> {
  const id = userId.trim();
  const sessionId = checkoutSessionId.trim();
  if (!id || !sessionId) {
    return { status: "error", email: "", message: "We couldn't confirm your payment." };
  }

  let succeeded = false;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent.latest_charge"],
    });

    const intent =
      session.payment_intent && typeof session.payment_intent !== "string"
        ? session.payment_intent
        : null;
    if (!intent) {
      return {
        status: "error",
        email: "",
        message: "We couldn't verify your payment. Please try again.",
      };
    }

    // Extra assurance beyond the shared record path: the confirmed intent must
    // belong to the caller we were handed (guards against a client passing a
    // mismatched userId). Amount/currency/status are re-checked inside
    // `recordSucceededPayment`.
    if (intent.metadata?.userId !== id) {
      return {
        status: "error",
        email: "",
        message: "We couldn't verify your payment. Please try again.",
      };
    }

    // Idempotent persist + gated audit, shared with the webhook backstop.
    const recorded = await recordSucceededPayment(intent, {
      ipHash: hashIp(getClientIp(await headers())),
    });
    if (recorded.status === "rejected") {
      return {
        status: "error",
        email: "",
        message: "We couldn't verify your payment. Please try again.",
      };
    }
    succeeded = true;
  } catch (err) {
    console.error("finalizeCheckoutSession failed:", err);
    return {
      status: "error",
      email: "",
      message: "We couldn't verify your payment. Please try again.",
    };
  }

  // Payment is recorded — hand off to the shared register + enroll path, which
  // drops the assessment cookie and returns the success state (no redirect); the
  // client uses it to advance to the confirmation step.
  if (succeeded) {
    const formData = new FormData();
    formData.set("userId", id);
    return completeAssessmentSetup({ status: "idle" }, formData);
  }
  return { status: "error", email: "", message: "We couldn't verify your payment. Please try again." };
}
