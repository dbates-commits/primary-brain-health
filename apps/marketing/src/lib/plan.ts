import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getPackage, resolvePackageKey } from "@pbh/booking";
import { db, payments } from "@pbh/db";
import { formatAmount } from "@pbh/emails";

export interface CurrentPlan {
  /** What the customer was actually charged, e.g. "$149". */
  price: string;
  /** The package's own name, e.g. "Basic Assessment Package". */
  name: string;
  /** The package's deliverables, in design order. */
  includes: ReadonlyArray<{ text: string; emphasis?: boolean }>;
}

/**
 * `formatAmount` always renders cents ("$149.00"); the design writes "$149".
 * Whole amounts drop the tail, anything with real cents keeps it rather than
 * being silently rounded away.
 */
function formatPrice(amountCents: number, currency: string): string {
  const formatted = formatAmount(amountCents, currency);
  return formatted.endsWith(".00") ? formatted.slice(0, -3) : formatted;
}

/**
 * The plan behind the Current Plan card, or null when there is nothing to show.
 *
 * The price comes off the charge, not the catalog: `displayPrice` on the
 * package is marketing copy by its own documentation, and a card headed CURRENT
 * PLAN should say what this customer paid. The name and the deliverables do come
 * from the package, because those are the promise the charge was made against —
 * and because the catalog's copy is the compliance-swept wording, which Figma's
 * is not.
 *
 * Null covers both "never paid" and "refunded": a refunded row is no longer
 * `succeeded`, which is the same line `getEntitledTrack` draws. Neither state
 * has a design, and both mean the same thing to the customer — no active plan.
 */
export async function getCurrentPlan(
  userId: string,
): Promise<CurrentPlan | null> {
  // An explicit column list, never `select()` — the same rule `lib/profile.ts`
  // follows, so nothing on the row is one prop-spread away from a client.
  const [payment] = await db
    .select({
      amountCents: payments.amountCents,
      currency: payments.currency,
      packageKey: payments.packageKey,
    })
    .from(payments)
    .where(and(eq(payments.userId, userId), eq(payments.status, "succeeded")))
    .orderBy(desc(payments.succeededAt))
    .limit(1);

  if (!payment) {
    return null;
  }

  // `resolvePackageKey` falls back to the default for a null or unknown key,
  // which is what rows written before `package_key` existed carry — and the
  // default is the price those charges were made against.
  const pkg = getPackage(resolvePackageKey(payment.packageKey))!;

  return {
    price: formatPrice(payment.amountCents, payment.currency),
    name: pkg.name,
    includes: pkg.includes,
  };
}
