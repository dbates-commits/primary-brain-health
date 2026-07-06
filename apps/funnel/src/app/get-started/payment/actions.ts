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

export type CreateIntentResult =
  | { status: "ready"; clientSecret: string }
  | { status: "error"; message: string };

/**
 * Start payment for the paying user: create a Stripe PaymentIntent for the fixed
 * assessment price and hand its client secret back to the Payment Element. We
 * pin the user id in the intent metadata so `finalizeAssessmentPayment` can
 * verify server-side that the confirmed intent belongs to this user.
 *
 * `allow_redirects: "never"` keeps the demo to inline (no-redirect) methods —
 * cards, incl. HSA/FSA cards, plus wallets — so no webhook or return_url round
 * trip is needed. Redirect-based methods and the webhook source-of-truth land in
 * pbh-bws.28.
 */
export async function createAssessmentPaymentIntent(
  userId: string,
): Promise<CreateIntentResult> {
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
    const intent = await stripe.paymentIntents.create({
      amount: ASSESSMENT_PRICE_CENTS,
      currency: ASSESSMENT_CURRENCY,
      customer: customerId,
      receipt_email: user.email,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      metadata: { userId: id, product: "brain-health-assessment" },
    });

    await writeAuditLog({
      eventType: "payment_pending",
      userId: id,
      metadata: { paymentIntentId: intent.id, amountCents: ASSESSMENT_PRICE_CENTS },
      ipHash: hashIp(getClientIp(await headers())),
    });

    if (!intent.client_secret) {
      return { status: "error", message: "Couldn't start payment. Please try again." };
    }
    return { status: "ready", clientSecret: intent.client_secret };
  } catch (err) {
    console.error("createAssessmentPaymentIntent failed:", err);
    return { status: "error", message: "Couldn't start payment. Please try again." };
  }
}

/**
 * Called after the client confirms the Payment Element. We re-fetch the intent
 * from Stripe (never trusting the client's word that it succeeded), assert it
 * succeeded for the right user / amount / currency, persist a `payments` row +
 * audit entry, then hand off to the existing register-and-enroll flow (which
 * drops the assessment cookie and returns the success state — the client then
 * advances to the confirmation step and links to /assessments).
 *
 * The `payments` insert is idempotent on the unique payment-intent id, so a
 * double-submit or retry can't create duplicate rows. Enrollment failures after
 * a successful charge come back as an error state — the charge stands and the
 * user can retry from /login (webhook-driven reconciliation is pbh-bws.28).
 */
export async function finalizeAssessmentPayment(
  userId: string,
  paymentIntentId: string,
): Promise<LinusState> {
  const id = userId.trim();
  if (!id || !paymentIntentId) {
    return { status: "error", email: "", message: "We couldn't confirm your payment." };
  }

  let succeeded = false;
  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });

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
    console.error("finalizeAssessmentPayment failed:", err);
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
