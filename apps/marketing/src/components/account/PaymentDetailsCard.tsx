import { getPaymentDetails } from "@/lib/payment-details";
import { AccountCard } from "./AccountCard";
import { PaymentDetailsPanel } from "./PaymentDetailsPanel";
import { openBillingPortalAction } from "./actions";

/**
 * Payment Details (Figma 1988:12234) — the card we charged, where the receipts
 * went, and the two routes into the Stripe Customer Portal.
 *
 * I/O only; everything visible lives in `PaymentDetailsPanel`. Figma's 32px
 * padding is `AccountCard`'s default `md:p-8`, so no override.
 *
 * No Storybook story: this is an async server component that reaches the
 * database. `Account/PaymentDetailsPanel` is where the UI is exercised.
 */
export async function PaymentDetailsCard({ userId }: { userId: string }) {
  const details = await getPaymentDetails(userId);

  return (
    <AccountCard>
      {details ? (
        <PaymentDetailsPanel
          details={details}
          action={openBillingPortalAction}
        />
      ) : (
        // Unreachable in practice — a session implies a row — but the read is
        // honestly nullable rather than asserted.
        <p className="font-body text-base text-on-surface-variant">
          We couldn&rsquo;t load your payment details. Please refresh and try
          again.
        </p>
      )}
    </AccountCard>
  );
}
