"use client";

import { useState, useTransition } from "react";
import { Button, Heading, PhosphorIcon } from "@pbh/ui";
import type {
  BillingPortalFlow,
  OpenBillingPortalAction,
} from "@/lib/billing-portal-flow";
import { formatCardBrand, formatCardExpiry } from "@/lib/card-brand";
import type { PaymentDetails } from "@/lib/payment-details";

interface PaymentDetailsPanelProps {
  details: PaymentDetails;
  action: OpenBillingPortalAction;
}

/**
 * Everything visible in the Payment Details card (Figma 1988:12234): the saved
 * card, where receipts go, and the two ways into the Stripe Customer Portal.
 *
 * Props-only and free of the database, which is what makes it storyable —
 * `PaymentDetailsCard` is the async half that does the reading. Same split, and
 * same reason, as `PlanSummary` under `PlanCard`.
 *
 * The copy is Figma's with one edit: the design reads "We use Stripe to proccess
 * any of your payments." — a typo, corrected here.
 *
 * Both links leave for Stripe in a new tab, which is why this is a client
 * component and the action returns a URL rather than redirecting: the customer
 * is mid-way through their account page and should come back to it, not have it
 * replaced. The tab is opened *synchronously* on the click and pointed at the
 * URL once it arrives — a pop-up blocker rejects any `window.open` that happens
 * after an await, because by then the user gesture is over.
 */
export function PaymentDetailsPanel({
  details,
  action,
}: PaymentDetailsPanelProps) {
  const { card, receiptsEmail } = details;
  const expires = card ? formatCardExpiry(card.expMonth, card.expYear) : null;
  const cardLabel = card
    ? `${formatCardBrand(card.brand)}${card.last4 ? ` ending ${card.last4}` : ""}`
    : "";

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function openPortal(flow: BillingPortalFlow) {
    setError(null);
    // Claimed inside the click, before any await. `noopener` is deliberately
    // not passed: with it the spec returns null and there would be no handle to
    // point anywhere. The opener is severed below instead.
    const tab = window.open("", "_blank");

    startTransition(async () => {
      const result = await action(flow);

      if (result.status === "error") {
        tab?.close();
        setError(result.message);
        return;
      }

      if (tab) {
        // Severed while the tab is still `about:blank` (same-origin), so Stripe
        // never gets a handle back to this page.
        tab.opener = null;
        tab.location.href = result.url;
        return;
      }

      // The browser refused the tab outright. Leaving in this one beats a click
      // that silently does nothing.
      window.location.href = result.url;
    });
  }

  return (
    <>
      <Heading
        as="h2"
        size="md"
        className="font-thin leading-[1.06] md:text-[2rem]"
      >
        Payment Details
      </Heading>
      <p className="mt-2 font-body text-base leading-[1.2] text-text-secondary">
        We use Stripe to process any of your payments. Your health information
        is never shared with them.
      </p>
      <hr className="mt-6 border-t border-border-subtle" />

      {card ? (
        <>
          <p className="mt-6 flex items-center gap-2 font-body text-base text-text-default">
            <PhosphorIcon
              name="CreditCard"
              size={24}
              className="mr-2 shrink-0"
              aria-hidden
            />
            {/* Each half is its own leaf node with its own exact text: the
                design greys the expiry against the brand, and it keeps both
                halves addressable rather than nested inside one another. */}
            <span>{cardLabel}</span>
            {/* Dropped rather than half-printed when the row predates the
                expiry columns (0025) — "Expires /" would read as a fault. */}
            {expires ? (
              <span className="text-text-secondary">Expires {expires}</span>
            ) : null}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 font-body text-base text-text-default">
            <PhosphorIcon
              name="Receipt"
              size={24}
              className="shrink-0"
              aria-hidden
            />
            <span>Receipts sent to {receiptsEmail}</span>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                openPortal("receipts");
              }}
              className="cursor-pointer text-brand-default underline-offset-4 hover:underline focus:outline-none focus-visible:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              View Receipts
            </button>
          </div>

          {/* Figma's Button `Type=Secondary` (1988:12253) draws a 1px black
              outline that the shared component's white variant has no
              counterpart for, and the design binds no token to it. */}
          <Button
            color="white"
            disabled={pending}
            onClick={() => {
              openPortal("payment-method");
            }}
            className="mt-6 border border-text-heading"
          >
            Update Payment Information
          </Button>

          {error ? (
            <p role="alert" className="mt-4 font-body text-base text-error">
              {error}
            </p>
          ) : null}
        </>
      ) : (
        // Signed up and never paid, or refunded. Both reach /profile — the page
        // gates on a session, not an entitlement — and neither has a card, a
        // receipt or a portal worth opening. Same line `PlanSummary` draws.
        <p className="mt-6 font-body text-base text-text-default">
          No payment method on file yet. Once you book an assessment, the card
          you pay with and your receipts will appear here.
        </p>
      )}
    </>
  );
}
