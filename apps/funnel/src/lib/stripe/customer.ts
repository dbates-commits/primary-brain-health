import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import type { User } from "@/db/schema/users";
import { getStripe } from "./server";

/** True when a Stripe error means a same-key request is already in flight. */
function isIdempotencyConflict(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    // Stripe tags concurrent same-key requests with this code / type.
    ((err as { code?: string }).code === "idempotency_key_in_use" ||
      (err as { type?: string }).type === "idempotency_error")
  );
}

/** Read the currently-stored Stripe Customer id for a user (or null). */
async function readStripeCustomerId(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row?.stripeCustomerId ?? null;
}

/**
 * Return the Stripe Customer id for a user, creating the Customer on first use.
 *
 * We already hold the billing identity (name, email, ZIP, state) on our own
 * `users` row, so we mirror it onto a Stripe Customer and persist the id in
 * `users.stripeCustomerId`. Attaching a Customer to the PaymentIntent groups the
 * charge under a durable object and is the prerequisite for reusing the saved
 * card downstream (`setup_future_usage` — a follow-up).
 *
 * Concurrency-safe without a DB lock (two truly-simultaneous first payments for
 * the same user — double-click, two tabs — can't create two Customers):
 *  1. `idempotencyKey` keyed by the user id — Stripe serializes concurrent
 *     creates with the same key, so at most one Customer is ever minted; the
 *     in-flight duplicate 409s instead of creating an orphan.
 *  2. The persist is a conditional CAS (`… WHERE stripe_customer_id IS NULL`,
 *     a single atomic statement neon-http can run), so the row is deterministic
 *     and a late writer can't clobber the winner.
 * On a 409 (the other request won), we read back and return its id.
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

  let customerId: string;
  try {
    const customer = await stripe.customers.create(
      {
        email: user.email,
        name: name || undefined,
        address,
        metadata: { userId: user.id },
      },
      { idempotencyKey: `pbh-create-customer-${user.id}` },
    );
    customerId = customer.id;
  } catch (err) {
    // A concurrent first payment for this user is mid-create under the same key.
    // No duplicate Customer was created; use the id the winner is storing.
    if (isIdempotencyConflict(err)) {
      const existing = await readStripeCustomerId(user.id);
      if (existing) {
        return existing;
      }
    }
    throw err;
  }

  // Claim the column only if still empty; if a racer beat us, keep theirs.
  const [claimed] = await db
    .update(users)
    .set({ stripeCustomerId: customerId })
    .where(and(eq(users.id, user.id), isNull(users.stripeCustomerId)))
    .returning({ stripeCustomerId: users.stripeCustomerId });
  if (claimed?.stripeCustomerId) {
    return claimed.stripeCustomerId;
  }

  // Lost the CAS: a racer stored first. Return the stored winner (idempotency
  // guarantees it's the same Customer, so this is belt-and-suspenders).
  return (await readStripeCustomerId(user.id)) ?? customerId;
}
