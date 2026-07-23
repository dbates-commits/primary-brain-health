import "server-only";

import { eq } from "drizzle-orm";
import type { Track } from "@pbh/copy";
import { db, users, writeAuditLog } from "@pbh/db";
import { getCatalogEntry, getStripe } from "@pbh/payments";
import type { CreateCheckoutResult } from "../types";
import { recordSucceededPayment } from "./fulfill";

// User-facing failure copy. Kept deliberately vague — the real cause goes to the
// server logs, never to the customer.
const ACCOUNT_NOT_FOUND = "We couldn't find your account.";
const CHECKOUT_START_FAILED = "Couldn't start payment. Please try again.";

function checkoutError(message: string): CreateCheckoutResult {
  return { status: "error", message };
}

/**
 * Start payment for the paying user: create a Stripe **Checkout Session**
 * (`ui_mode: "embedded_page"`) for the fixed assessment price and hand its
 * `client_secret` back to the client, which mounts Stripe's full **Embedded
 * Checkout** form. Stripe now recommends the Checkout Sessions API over raw
 * PaymentIntents; the Session carries the line item, Customer, and metadata in
 * one object.
 *
 * `redirect_on_completion: "never"` keeps the customer on our page after paying:
 * Embedded Checkout fires its `onComplete` callback instead of redirecting, and
 * the client then calls `verifyAndRecordCheckout` (via the app's finalize action)
 * with the returned `sessionId`. `payment_method_types: ["card"]` keeps this to
 * inline (no-redirect) card methods — incl. HSA/FSA.
 *
 * `ipHash` is supplied by the caller (the app reads request headers); this core
 * stays framework-agnostic.
 */
export async function createCheckoutSessionCore(
  userId: string,
  opts: { ipHash: string; track: Track },
): Promise<CreateCheckoutResult> {
  const id = userId.trim();
  if (!id) {
    return checkoutError(ACCOUNT_NOT_FOUND);
  }

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) {
    return checkoutError(ACCOUNT_NOT_FOUND);
  }

  // Pinned onto both the Session and the PaymentIntent it creates, so that
  // `verifyAndRecordCheckout` and the webhook backstop can each confirm
  // server-side that the payment belongs to this user — and which product they
  // bought. `track` is set here, server-side, and comes back on the signed
  // webhook event; fulfillment cross-checks it against the amount, so a
  // tampered value can't fulfill the cheaper product at the dearer price.
  const metadata = {
    userId: id,
    product: "brain-health-assessment",
    track: opts.track,
  };

  try {
    const stripe = getStripe();
    // Catalog entry is the source of truth for amount/currency/name; we only
    // pass its price ID as the line item and let Stripe render the rest.
    const catalog = await getCatalogEntry(opts.track);
    // One-time guest checkout — no Stripe Customer. We don't save cards for
    // off-session reuse, so a durable Customer object buys nothing here; the
    // receipt goes to `receipt_email` and the user is tracked via metadata.
    // `customer_email` prefills the email field in Embedded Checkout from the
    // account we already have (it doesn't create a Customer).
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      redirect_on_completion: "never",
      locale: "en",
      mode: "payment",
      customer_email: user.email,
      payment_method_types: ["card"],
      line_items: [{ quantity: 1, price: catalog.priceId }],
      payment_intent_data: { receipt_email: user.email, metadata },
      metadata,
    });

    await writeAuditLog({
      eventType: "payment_pending",
      userId: id,
      metadata: {
        checkoutSessionId: session.id,
        amountCents: catalog.amountCents,
        productName: catalog.productName,
        track: opts.track,
      },
      ipHash: opts.ipHash,
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
    console.error("createCheckoutSessionCore failed:", err);
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
export async function verifyAndRecordCheckout(
  userId: string,
  sessionId: string,
  opts: { ipHash: string },
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

  const recorded = await recordSucceededPayment(intent, { ipHash: opts.ipHash });
  return recorded.status !== "rejected";
}
