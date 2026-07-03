"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { writeAuditLog } from "@/db/audit";
import { getClientIp, getOrigin, hashIp } from "@/lib/request-meta";
import { getStripe } from "@/lib/stripe/server";
import {
  ASSESSMENT_CURRENCY,
  ASSESSMENT_PRICE_CENTS,
} from "@/lib/stripe/pricing";
import { registerAndEnrollUserById } from "@/app/assessments/register-and-enroll";
import { recordSucceededPayment } from "./fulfill";

export type CreateCheckoutResult =
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

export type FinalizeCheckoutResult =
  | { status: "ok"; userId: string }
  | { status: "error"; message: string };

/**
 * Start payment for the paying user: create a Stripe **hosted** Checkout Session
 * for the fixed assessment price and return its hosted-page `url` for the client
 * to redirect to (checkout.stripe.com). We pin the user id in BOTH the session
 * metadata and `payment_intent_data.metadata` — the latter carries onto the
 * resulting PaymentIntent so the existing webhook + the return route can verify
 * server-side that the confirmed payment belongs to this user.
 *
 * The funnel is a single-page client stepper, so client state is lost across the
 * redirect. That's why the user id lives in the session (recovered on return),
 * and why `success_url` points at our `/get-started/payment/return` route.
 */
export async function createAssessmentCheckoutSession(
  userId: string,
): Promise<CreateCheckoutResult> {
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
    const origin = getOrigin(await headers());
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      ui_mode: "hosted_page",
      mode: "payment",
      success_url: `${origin}/get-started/payment/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/get-started?payment=cancelled`,
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
      metadata: { checkoutSessionId: session.id, amountCents: ASSESSMENT_PRICE_CENTS },
      ipHash: hashIp(getClientIp(await headers())),
    });

    if (!session.url) {
      return { status: "error", message: "Couldn't start payment. Please try again." };
    }
    return { status: "ready", url: session.url };
  } catch (err) {
    console.error("createAssessmentCheckoutSession failed:", err);
    return { status: "error", message: "Couldn't start payment. Please try again." };
  }
}

/**
 * Called from the hosted-checkout return route after Stripe redirects back with
 * the session id. We re-fetch the Checkout Session from Stripe (never trusting
 * the URL), resolve its PaymentIntent, persist a `payments` row + audit entry
 * idempotently (shared with the webhook backstop), then register/enroll the user
 * in Linus. Cookie + redirect are handled by the route handler, not here.
 *
 * The user id is read from the session's PaymentIntent metadata — the return
 * route has no client state to trust.
 */
export async function finalizeCheckoutSession(
  checkoutSessionId: string,
): Promise<FinalizeCheckoutResult> {
  const sessionId = checkoutSessionId.trim();
  if (!sessionId) {
    return { status: "error", message: "We couldn't confirm your payment." };
  }

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
      return { status: "error", message: "We couldn't verify your payment." };
    }

    const userId = intent.metadata?.userId?.trim() ?? "";
    if (!userId) {
      return { status: "error", message: "We couldn't verify your payment." };
    }

    // Idempotent persist + gated audit, shared with the webhook backstop.
    const recorded = await recordSucceededPayment(intent, {
      ipHash: hashIp(getClientIp(await headers())),
    });
    if (recorded.status === "rejected") {
      return { status: "error", message: "We couldn't verify your payment." };
    }

    // Register + enroll (idempotent). A Linus failure here still leaves the
    // payment recorded; the webhook retries enrollment as a backstop.
    const enrolled = await registerAndEnrollUserById(userId);
    if (enrolled.status === "error") {
      return { status: "error", message: enrolled.message };
    }

    return { status: "ok", userId };
  } catch (err) {
    console.error("finalizeCheckoutSession failed:", err);
    return { status: "error", message: "We couldn't verify your payment." };
  }
}
