/**
 * Format a Stripe-style minor-unit amount (e.g. 14900) + ISO currency code
 * (e.g. "usd") for display: `formatAmount(14900, "usd")` → "$149.00".
 */
export function formatAmount(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

/** "visa" + "4242" → "Visa •••• 4242"; degrades gracefully when either is missing. */
export function formatCard(
  cardBrand: string | null | undefined,
  cardLast4: string | null | undefined,
): string | null {
  if (!cardLast4) {
    return null;
  }
  const brand = cardBrand
    ? cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1)
    : "Card";
  return `${brand} •••• ${cardLast4}`;
}
