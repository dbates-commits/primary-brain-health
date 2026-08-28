import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import { db, users } from "@pbh/db";
import { getStripe } from "@pbh/payments";

/** The columns `ensureStripeCustomer` needs — never the whole row. */
export interface StripeCustomerOwner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  stripeCustomerId: string | null;
}

/**
 * The account's durable Stripe Customer, created once and reused forever.
 *
 * Checkout ran as a guest until the account page needed the Customer Portal,
 * which takes a `cus_…` and nothing else — there is no "open the portal for this
 * email" call. A Customer is also what makes a later plan upgrade a second
 * charge against the same person rather than a second stranger who happens to
 * share an address, and what gives the portal's billing history somewhere to
 * hang (see `invoice_creation` in `createCheckoutSessionCore`).
 *
 * The write is a claim, not an assignment: `WHERE stripe_customer_id IS NULL`.
 * The client action and the webhook already race on this account, and two
 * concurrent callers would otherwise each create a Customer and the second would
 * overwrite the first — leaving live invoices attached to a `cus_…` no row
 * points at. The loser of the race drops its own Customer and returns the
 * winner's. That orphan has no charges, no payment methods and no invoices; it
 * costs nothing to leave, but deleting it keeps the Stripe customer list honest.
 */
export async function ensureStripeCustomer(
  user: StripeCustomerOwner,
): Promise<string> {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
    // The link back, so a customer found in the Stripe dashboard can be traced
    // to an account without a reverse lookup by email.
    metadata: { userId: user.id },
  });

  const [claimed] = await db
    .update(users)
    .set({ stripeCustomerId: customer.id })
    .where(and(eq(users.id, user.id), isNull(users.stripeCustomerId)))
    .returning({ stripeCustomerId: users.stripeCustomerId });

  if (claimed?.stripeCustomerId) {
    return claimed.stripeCustomerId;
  }

  // Lost the race (or the row vanished): re-read and defer to whatever is
  // persisted, which is the only id the rest of the system will ever see.
  const [row] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (row?.stripeCustomerId) {
    await stripe.customers.del(customer.id).catch((err: unknown) => {
      // Never fatal: the charge matters, a stray empty Customer does not.
      console.error("failed to delete orphaned Stripe customer:", err);
    });
    return row.stripeCustomerId;
  }

  return customer.id;
}
