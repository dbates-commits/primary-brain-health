import { AccountCard } from "./AccountCard";

/**
 * TODO: Payment Details — Figma 2092:13169. Heading and sub-copy over a rule,
 * the saved card line, the receipts line with its "View Receipts" link, and the
 * Update Payment Information button.
 *
 * Stub: this card's slot in the grid is final. Everything inside, `min-h-*`
 * included, goes when the real card lands.
 */
export function PaymentDetailsCard() {
  return (
    <AccountCard className="min-h-[328px]">
      <p className="font-body text-base text-on-surface-variant">
        Payment Details — coming soon.
      </p>
    </AccountCard>
  );
}
