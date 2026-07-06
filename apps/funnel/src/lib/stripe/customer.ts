import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import type { User } from "@/db/schema/users";
import { getStripe } from "./server";

/**
 * Return the Stripe Customer id for a user, creating the Customer on first use.
 *
 * We already hold the billing identity (name, email, ZIP, state) on our own
 * `users` row, so we mirror it onto a Stripe Customer and persist the id in
 * `users.stripeCustomerId`. Attaching a Customer to the PaymentIntent groups the
 * charge under a durable object and is the prerequisite for reusing the saved
 * card downstream (`setup_future_usage` — a follow-up).
 *
 * Idempotent per user: once `stripeCustomerId` is set we reuse it and never
 * create a second Customer. Only non-empty fields are sent, so a user missing
 * ZIP/state still gets a valid Customer (address is best-effort).
 */
export async function getOrCreateStripeCustomer(user: User): Promise<string> {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const stripe = getStripe();

  const name = [user.firstName, user.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  // US-only funnel; ZIP + state are the only address parts we collect. Send the
  // address only when we actually have a postal code or state.
  const address =
    user.zip || user.stateOfResidence
      ? {
          postal_code: user.zip ?? undefined,
          state: user.stateOfResidence ?? undefined,
          country: "US",
        }
      : undefined;

  const customer = await stripe.customers.create({
    email: user.email,
    name: name || undefined,
    address,
    metadata: { userId: user.id },
  });

  await db
    .update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, user.id));

  return customer.id;
}
