/**
 * Per-track product pricing, resolved from the Stripe catalog. The Price object
 * is the single source of truth for the amount and currency; we only configure
 * *which* price each track uses, via env (see env.ts). Server-only — it calls
 * the Stripe API. The checkout UI never imports this: Embedded Checkout renders
 * the amount straight from the Session/Price.
 *
 * Nothing here branches on a dollar figure. Code asks for a `Track` and Stripe
 * answers with the amount, so a repricing is an env/dashboard change rather
 * than a code change.
 */
import type { Track } from "@pbh/copy";
import { getStripePriceId } from "./env";
import { getStripe } from "./server";

export interface CatalogEntry {
  track: Track;
  priceId: string;
  amountCents: number;
  currency: string;
  /** Name of the Stripe Product this price belongs to (e.g. shown on receipts). */
  productName: string;
}

/** @deprecated Use `CatalogEntry`. Kept so existing imports keep compiling. */
export type AssessmentCatalogEntry = CatalogEntry;

const cache = new Map<Track, CatalogEntry>();

/**
 * Fetch a track's configured Price (and its Product) from Stripe, cached per
 * warm instance so the checkout and fulfillment paths don't hit the API on
 * every request/event. Expands the Product so callers can surface its name.
 * Throws if the price is inactive or isn't a fixed one-off amount.
 */
export async function getCatalogEntry(track: Track): Promise<CatalogEntry> {
  const cached = cache.get(track);
  if (cached) {
    return cached;
  }
  const priceId = getStripePriceId(track);
  const price = await getStripe().prices.retrieve(priceId, {
    expand: ["product"],
  });
  if (!price.active) {
    throw new Error(`Stripe price ${priceId} (${track}) is not active.`);
  }
  if (price.unit_amount == null) {
    throw new Error(
      `Stripe price ${priceId} (${track}) has no fixed unit_amount (unsupported pricing model).`,
    );
  }
  // `product` is expanded above; it's a string ID only if not expanded, and a
  // deleted product carries no `name`. Fall back so a rename/delete never 500s.
  const product = price.product;
  const productName =
    typeof product !== "string" && !product.deleted && product.name
      ? product.name
      : "Brain health assessment";
  const entry: CatalogEntry = {
    track,
    priceId,
    amountCents: price.unit_amount,
    currency: price.currency,
    productName,
  };
  cache.set(track, entry);
  return entry;
}

/**
 * @deprecated Call `getCatalogEntry(track)` instead. This resolves the wellness
 * price, which is what the single-product funnel always charged.
 */
export async function getAssessmentCatalogEntry(): Promise<CatalogEntry> {
  return getCatalogEntry("wellness");
}
