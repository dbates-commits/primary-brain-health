/**
 * The contract between the Payment Details card and its server action.
 * No `server-only` here, so the panel and its story can import it.
 */

/**
 * Which of the two links on the card was pressed. "receipts" opens the portal's
 * home, which is where the billing history lives — only the payment-method
 * update has a deep link of its own.
 */
export type BillingPortalFlow = "receipts" | "payment-method";

/**
 * The action hands back a URL rather than redirecting to it: the card opens
 * Stripe in a new tab, so the navigation has to happen in the browser, where
 * the click is. A server-side `redirect` can only replace the current page.
 */
export type BillingPortalResult =
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

export type OpenBillingPortalAction = (
  flow: BillingPortalFlow,
) => Promise<BillingPortalResult>;

/**
 * Re-resolve the flow server-side. It arrives as a server-action argument, so
 * it is client-supplied like any other; anything unrecognised falls back to the
 * portal home, which is the harmless one. There is nothing to protect here
 * beyond the identity, which the client never supplies.
 */
export function normalizePortalFlow(value: unknown): BillingPortalFlow {
  return value === "payment-method" ? "payment-method" : "receipts";
}
