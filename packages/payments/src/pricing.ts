/**
 * Assessment prices, resolved from the Stripe catalog. The Price object is the
 * single source of truth for the amount and currency; we only configure *which*
 * price, via the env var each package names (see `ASSESSMENT_PACKAGES` in
 * `@pbh/booking`). Server-only — it calls the Stripe API. The checkout UI never
 * imports this: Embedded Checkout renders the amount straight from the
 * Session/Price.
 */
import { getStripeAssessmentPriceId, getStripePriceIdFromEnv } from "./env";
import { getStripe } from "./server";

export interface AssessmentCatalogEntry {
  priceId: string;
  amountCents: number;
  currency: string;
  /** Name of the Stripe Product this price belongs to (e.g. shown on receipts). */
  productName: string;
}

/**
 * Keyed by env var rather than package key, so this module stays independent of
 * `@pbh/booking` (which imports nothing server-side) and two packages pointing
 * at the same Price share one entry. Per warm instance, as before.
 */
const cache = new Map<string, AssessmentCatalogEntry>();

/**
 * Fetch a package's configured Price (and its Product) from Stripe, cached per
 * warm instance so the checkout and fulfillment paths don't hit the API on every
 * request/event. Expands the Product so callers can surface its name. Throws if
 * the price is inactive or isn't a fixed one-off amount.
 *
 * Defaults to the basic package's var so existing callers — notably the funnel's
 * webhook fulfillment — keep working unchanged.
 */
export async function getAssessmentCatalogEntry(
  priceEnvVar = "STRIPE_ASSESSMENT_PRICE_ID",
): Promise<AssessmentCatalogEntry> {
  const hit = cache.get(priceEnvVar);
  if (hit) {
    return hit;
  }
  const priceId =
    priceEnvVar === "STRIPE_ASSESSMENT_PRICE_ID"
      ? getStripeAssessmentPriceId()
      : getStripePriceIdFromEnv(priceEnvVar);
  const price = await getStripe().prices.retrieve(priceId, {
    expand: ["product"],
  });
  if (!price.active) {
    throw new Error(`Stripe price ${priceId} is not active.`);
  }
  if (price.unit_amount == null) {
    throw new Error(
      `Stripe price ${priceId} has no fixed unit_amount (unsupported pricing model).`,
    );
  }
  // `product` is expanded above; it's a string ID only if not expanded, and a
  // deleted product carries no `name`. Fall back so a rename/delete never 500s.
  const product = price.product;
  const productName =
    typeof product !== "string" && !product.deleted && product.name
      ? product.name
      : "Brain health assessment";
  const entry: AssessmentCatalogEntry = {
    priceId,
    amountCents: price.unit_amount,
    currency: price.currency,
    productName,
  };
  cache.set(priceEnvVar, entry);
  return entry;
}
