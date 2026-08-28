import "server-only";

import { and, eq } from "drizzle-orm";
import { ensureStripeCustomer } from "@pbh/booking/server";
import { db, payments, users } from "@pbh/db";
import { siteBaseUrl } from "@pbh/emails";
import { getStripe } from "@pbh/payments";
import type { BillingPortalFlow } from "./billing-portal-flow";

/**
 * A one-shot Stripe Customer Portal URL for this account, or null when there is
 * nothing to open.
 *
 * Null covers exactly one case worth stating: no succeeded payment. The portal
 * would render an empty billing history and a card form for a person who has
 * never bought anything, and — worse — asking for it would mint a Stripe
 * Customer for every signed-up visitor who clicked. The card hides both links
 * in that state; this is the server-side half of the same rule, because a link
 * that is only hidden in the markup is not a control.
 *
 * The URL expires and is single-use, so it is never cached or stored — the
 * action creates one per click and redirects straight to it.
 */
export async function createBillingPortalUrl(
  userId: string,
  flow: BillingPortalFlow,
): Promise<string | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      stripeCustomerId: users.stripeCustomerId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  const [paid] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.userId, userId), eq(payments.status, "succeeded")))
    .limit(1);

  if (!paid) {
    return null;
  }

  // Almost always a no-op read: checkout attaches the Customer before charging.
  // It creates one only for an account that paid before we started doing that,
  // whose portal opens on an empty billing history — their charge was made as a
  // guest and there is no invoice to move onto the new Customer. They can still
  // update the card, which is the half that has a future use.
  const customerId = await ensureStripeCustomer(user);

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    // Back to the card they left from. The portal configuration carries a
    // default return URL too, but it is a single dashboard value per mode and
    // would send Preview traffic to staging.
    return_url: `${siteBaseUrl()}/profile`,
    ...(flow === "payment-method"
      ? { flow_data: { type: "payment_method_update" as const } }
      : {}),
  });

  return session.url;
}
