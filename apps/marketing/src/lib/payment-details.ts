import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db, payments, users } from "@pbh/db";

export interface PaymentDetails {
  /** Where Stripe sends the receipt — the account address, as at checkout. */
  receiptsEmail: string;
  /** The card that paid, or null for an account that never completed a charge. */
  card: {
    brand: string | null;
    last4: string | null;
    expMonth: number | null;
    expYear: number | null;
  } | null;
}

/**
 * Everything the Payment Details card renders (Figma 1988:12234).
 *
 * The card comes off the `payments` row, not from Stripe: it is the card we
 * charged, which is a fact about that payment, and re-fetching the Customer's
 * current payment method on every render would both cost a round trip and
 * quietly show a different card than the one the receipt names.
 *
 * `card: null` is the honest state for somebody who signed up and never paid —
 * they can still reach /profile (see the note on the page) — and for a refunded
 * account, which stops being `succeeded` on the same line `getCurrentPlan` and
 * `getEntitledTrack` draw.
 */
export async function getPaymentDetails(
  userId: string,
): Promise<PaymentDetails | null> {
  // An explicit column list, never `select()` — the same rule `lib/profile.ts`
  // and `lib/plan.ts` follow, so nothing on either row is one prop-spread away
  // from a client component.
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  const [payment] = await db
    .select({
      cardBrand: payments.cardBrand,
      cardLast4: payments.cardLast4,
      cardExpMonth: payments.cardExpMonth,
      cardExpYear: payments.cardExpYear,
    })
    .from(payments)
    .where(and(eq(payments.userId, userId), eq(payments.status, "succeeded")))
    .orderBy(desc(payments.succeededAt))
    .limit(1);

  return {
    receiptsEmail: user.email,
    card: payment
      ? {
          brand: payment.cardBrand,
          last4: payment.cardLast4,
          expMonth: payment.cardExpMonth,
          expYear: payment.cardExpYear,
        }
      : null,
  };
}
