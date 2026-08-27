/**
 * Display formatting for the saved-card line on the account page
 * ("VISA ending 4242 Expires 04/27", Figma 2060:6679).
 *
 * Kept out of `payment-details.ts` — which is `server-only` — so the panel and
 * its story can format without reaching the database.
 */

/**
 * Stripe's `card.brand` is a lowercase slug (`visa`, `amex`, `unionpay`). The
 * design sets the brand in caps, and uppercasing the slug alone would print
 * "UNIONPAY" and "DINERS". Anything unlisted falls back to the uppercased slug,
 * which is wrong-looking at worst and never blank.
 */
const BRAND_LABELS: Record<string, string> = {
  amex: "AMEX",
  cartes_bancaires: "CARTES BANCAIRES",
  diners: "DINERS CLUB",
  discover: "DISCOVER",
  eftpos_au: "EFTPOS",
  jcb: "JCB",
  link: "LINK",
  mastercard: "MASTERCARD",
  unionpay: "UNIONPAY",
  visa: "VISA",
};

export function formatCardBrand(brand: string | null): string {
  if (!brand) {
    // Stripe's own value for a brand it can't identify, and the right word for
    // a row written before we captured one.
    return "CARD";
  }
  return BRAND_LABELS[brand] ?? brand.toUpperCase();
}

/**
 * "04/27" — two-digit month, two-digit year, the format the card itself is
 * embossed with. Null when either half is missing, so the caller can drop the
 * phrase rather than print half of it.
 */
export function formatCardExpiry(
  month: number | null,
  year: number | null,
): string | null {
  if (!month || !year) {
    return null;
  }
  return `${String(month).padStart(2, "0")}/${String(year % 100).padStart(2, "0")}`;
}
