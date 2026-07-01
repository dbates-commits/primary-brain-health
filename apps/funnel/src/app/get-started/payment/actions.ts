"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { payments, users } from "@/db/schema";
import { writeAuditLog } from "@/db/audit";
import { getClientIp, hashIp } from "@/lib/request-meta";
import { getStripe } from "@/lib/stripe/server";
import {
  ASSESSMENT_CURRENCY,
  ASSESSMENT_PRICE_CENTS,
} from "@/lib/stripe/pricing";
import { completeAssessmentSetup } from "@/app/assessments/actions";
import type { LinusState } from "@/app/assessments/register-and-enroll";

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
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (!user) {
    return { status: "error", message: "We couldn't find your account." };
  }

  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: ASSESSMENT_PRICE_CENTS,
      currency: ASSESSMENT_CURRENCY,
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
 * drops the assessment cookie and redirects to /assessments).
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

    const belongsToUser = intent.metadata?.userId === id;
    const rightAmount =
      intent.amount === ASSESSMENT_PRICE_CENTS &&
      intent.currency === ASSESSMENT_CURRENCY;
    if (
      intent.status !== "succeeded" ||
      !belongsToUser ||
      !rightAmount
    ) {
      return {
        status: "error",
        email: "",
        message: "We couldn't verify your payment. Please try again.",
      };
    }

    // Card brand/last4 come off the latest charge (expanded above). Never store
    // more than these non-sensitive fields — the PAN/CVV stay with Stripe.
    const charge =
      intent.latest_charge && typeof intent.latest_charge !== "string"
        ? intent.latest_charge
        : null;
    const card = charge?.payment_method_details?.card ?? null;

    await db
      .insert(payments)
      .values({
        userId: id,
        stripePaymentIntentId: intent.id,
        amountCents: intent.amount,
        currency: intent.currency,
        status: "succeeded",
        cardBrand: card?.brand ?? null,
        cardLast4: card?.last4 ?? null,
        succeededAt: new Date(),
      })
      .onConflictDoNothing({ target: payments.stripePaymentIntentId });

    await writeAuditLog({
      eventType: "payment_succeeded",
      userId: id,
      metadata: { paymentIntentId: intent.id, amountCents: intent.amount },
      ipHash: hashIp(getClientIp(await headers())),
    });
    succeeded = true;
  } catch (err) {
    console.error("finalizeAssessmentPayment failed:", err);
    return {
      status: "error",
      email: "",
      message: "We couldn't verify your payment. Please try again.",
    };
  }

  // Payment is recorded — hand off to the shared register + enroll + redirect
  // path (out of the try/catch so its NEXT_REDIRECT isn't swallowed).
  if (succeeded) {
    const formData = new FormData();
    formData.set("userId", id);
    return completeAssessmentSetup({ status: "idle" }, formData);
  }
  return { status: "error", email: "", message: "We couldn't verify your payment. Please try again." };
}
