import "server-only";

import { and, eq } from "drizzle-orm";
import { db, payments, users, writeAuditLog } from "@pbh/db";
import { getAssessmentCatalogEntry, getStripe } from "@pbh/payments";
import { getPackage, resolvePackageKey } from "../packages";
import type { CreateCheckoutResult } from "../types";
import { recordSucceededPayment } from "./fulfill";
import { ensureStripeCustomer } from "./stripe-customer";

// User-facing failure copy. Kept deliberately vague — the real cause goes to the
// server logs, never to the customer.
const ACCOUNT_NOT_FOUND = "We couldn't find your account.";
const CHECKOUT_START_FAILED = "Couldn't start payment. Please try again.";
// The one error here that names its cause: the customer is not stuck, they are
// finished, and telling them so is what stops them retrying the card.
const ALREADY_PAID =
  "You've already paid for this assessment. Check your email for the receipt.";

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
  opts: { ipHash: string; packageKey?: string },
): Promise<CreateCheckoutResult> {
  const id = userId.trim();
  if (!id) {
    return checkoutError(ACCOUNT_NOT_FOUND);
  }

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) {
    return checkoutError(ACCOUNT_NOT_FOUND);
  }

  // Refuse to mint a second Session for someone who has already paid (pbh-ypf).
  // `PaymentStep` mints one per mount, so any route back into the payment step —
  // a stale tab, Back, a `?booking=resume` link followed twice — was a reachable
  // double charge. The modal locks that step, but a UI lock is not a control:
  // these are server actions, and the guard has to be here.
  //
  // Same test the resume resolver calls `done` and `getEntitledTrack` calls
  // entitled: one `payments` row that reached `succeeded`.
  const [paid] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.userId, id), eq(payments.status, "succeeded")))
    .limit(1);
  if (paid) {
    return checkoutError(ALREADY_PAID);
  }

  // The package stored on the account at signup wins. The client also sends a
  // key, but only as a fallback for accounts created before this was recorded:
  // trusting it would let someone drive the $449 flow in the UI while quietly
  // checking out at the $149 price. Either way the value is re-resolved
  // server-side, so an unknown or unpurchasable key can't start a checkout we
  // can't fulfil.
  const pkg = getPackage(
    resolvePackageKey(user.selectedPackageKey ?? opts.packageKey),
  )!;

  // Pinned onto both the Session and the PaymentIntent it creates, so that
  // `verifyAndRecordCheckout` and the webhook backstop can each confirm
  // server-side that the payment belongs to this user. `packageKey` rides along
  // so fulfillment records what was bought from the *verified* charge rather
  // than from anything the client sends a second time.
  const metadata = {
    userId: id,
    product: "brain-health-assessment",
    packageKey: pkg.key,
  };

  try {
    const stripe = getStripe();
    // Catalog entry is the source of truth for amount/currency/name; we only
    // pass its price ID as the line item and let Stripe render the rest.
    const catalog = await getAssessmentCatalogEntry(pkg.priceEnvVar);
    // Charge a durable Customer, not a guest. This was guest checkout while
    // /profile had nothing to show: no card is saved for off-session reuse, so
    // the Customer bought nothing. The account page's Payment Details card
    // changes that — the Customer Portal behind "View Receipts" and "Update
    // Payment Information" is addressed by `cus_…` and by nothing else — and an
    // upgrade later should be a second charge on the same person rather than a
    // second stranger with the same address. `customer` and `customer_email`
    // are mutually exclusive, so the email is carried by the Customer instead.
    const customerId = await ensureStripeCustomer(user);
    // `invoice_creation` is what puts anything in the portal's billing history.
    // Without it a one-off PaymentIntent leaves a charge and a Stripe receipt
    // but no invoice, and the portal renders an empty list — so "View Receipts"
    // would open a page that proves nothing. Off by default; it costs one
    // finalized invoice per payment.
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      redirect_on_completion: "never",
      locale: "en",
      mode: "payment",
      customer: customerId,
      // Without this, naming a `customer` makes Checkout stop writing back:
      // `ensureStripeCustomer` creates the Customer from email + name only, and
      // the billing address the buyer types here would be discarded. The
      // invoice below is generated from the Customer, so the bill-to line on
      // every receipt would be blank (pbh-yzl).
      customer_update: { address: "auto", name: "auto" },
      invoice_creation: { enabled: true },
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
