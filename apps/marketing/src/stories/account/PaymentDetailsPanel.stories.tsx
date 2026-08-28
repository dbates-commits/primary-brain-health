import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AccountCard } from "@/components/account/AccountCard";
import { PaymentDetailsPanel } from "@/components/account/PaymentDetailsPanel";
import type { BillingPortalFlow } from "@/lib/billing-portal-flow";
import type { PaymentDetails } from "@/lib/payment-details";
import { billingPortalSpy, PORTAL_URL } from './mock-actions';

/** The card Stripe's own test Visa leaves behind, which is what staging shows. */
const PAID: PaymentDetails = {
  receiptsEmail: 'david.smith@email.com',
  card: { brand: 'visa', last4: '4242', expMonth: 4, expYear: 2027 },
};

/**
 * A stand-in for the tab the panel claims on click, so a story never actually
 * opens one. Records where it was pointed and whether it was closed again.
 */
function stubWindowOpen() {
  const tab = { opener: {} as unknown, location: { href: '' }, closed: false };
  const real = window.open;
  window.open = (() => {
    tab.closed = false;
    return tab as unknown as Window;
  }) as typeof window.open;
  (tab as { close?: () => void }).close = () => {
    tab.closed = true;
  };
  return {
    tab,
    restore: () => {
      window.open = real;
    },
  };
}

const meta = {
  title: 'Account/PaymentDetailsPanel',
  component: PaymentDetailsPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The body of the Payment Details card (Figma 1988:12234): the card we charged, the ' +
          'receipts address, and the two links into the Stripe Customer Portal. Both leave for ' +
          'Stripe in a new tab, claimed synchronously on the click so a pop-up blocker cannot ' +
          'reject it. `PaymentDetailsCard` is the async half that reads the row.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      // The real shell, at the right-hand column's 32px padding.
      <div className="max-w-[836px]">
        <AccountCard>
          <Story />
        </AccountCard>
      </div>
    ),
  ],
} satisfies Meta<typeof PaymentDetailsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A paid account: brand, last4, expiry, receipts address and both portal links. */
export const Paid: Story = {
  args: { details: PAID, action: billingPortalSpy(() => {}) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('VISA ending 4242')).toBeVisible();
    await expect(canvas.getByText('Expires 04/27')).toBeVisible();
    await expect(
      canvas.getByText('Receipts sent to david.smith@email.com'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'View Receipts' }),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Update Payment Information' }),
    ).toBeVisible();
  },
};

/** Filled by the story below; module scope so the spy can be bound in `args`. */
const flows: BillingPortalFlow[] = [];

/**
 * The two links must ask for different flows — the whole difference between
 * landing on the portal's billing history and landing in its card form — and
 * each must point the new tab at the URL that comes back.
 */
export const OpensStripeInANewTab: Story = {
  // The spy is wired at definition time, not in `play`: reassigning `args`
  // after the panel has rendered would leave the original action bound to it.
  args: {
    details: PAID,
    action: billingPortalSpy((flow) => flows.push(flow), undefined, 0),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // A re-run (the docs page renders every story) starts from empty.
    flows.length = 0;
    const { tab, restore } = stubWindowOpen();

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'View Receipts' }),
      );
      await waitFor(() => {
        expect(flows).toEqual(['receipts']);
        expect(tab.location.href).toBe(PORTAL_URL);
      });
      // Severed while the tab is still about:blank, so Stripe gets no handle back.
      await expect(tab.opener).toBeNull();

      tab.location.href = '';
      await userEvent.click(
        canvas.getByRole('button', { name: 'Update Payment Information' }),
      );
      await waitFor(() => {
        expect(flows).toEqual(['receipts', 'payment-method']);
        expect(tab.location.href).toBe(PORTAL_URL);
      });
    } finally {
      restore();
    }
  },
};

/**
 * Stripe refused — an outage, or a live key without the Customer portal
 * permission. The claimed tab is closed rather than left on `about:blank`, and
 * the customer is told in the card instead of in a tab they can't see.
 */
export const PortalUnavailable: Story = {
  args: {
    details: PAID,
    action: billingPortalSpy(
      () => {},
      { status: 'error', message: "We couldn't open your billing details. Please try again." },
      0,
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { tab, restore } = stubWindowOpen();

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'View Receipts' }),
      );
      await waitFor(() => {
        expect(canvas.getByRole('alert')).toHaveTextContent(
          "We couldn't open your billing details.",
        );
      });
      await expect(tab.closed).toBe(true);
      await expect(tab.location.href).toBe('');
    } finally {
      restore();
    }
  },
};

/**
 * Signed up, never paid. /profile gates on a session rather than an
 * entitlement, so this state is reachable — and it has no card, no receipt and
 * no portal worth opening.
 */
export const NoPaymentYet: Story = {
  args: {
    details: { receiptsEmail: 'david.smith@email.com', card: null },
    action: billingPortalSpy(() => {}),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/No payment method on file yet/),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'View Receipts' }),
    ).toBeNull();
  },
};

/**
 * A row written before migration 0025 added the expiry columns: brand and last4
 * survive, the "Expires" phrase is dropped rather than printed half-empty.
 */
export const WithoutExpiry: Story = {
  args: {
    details: {
      receiptsEmail: 'david.smith@email.com',
      card: { brand: 'mastercard', last4: '4444', expMonth: null, expYear: null },
    },
    action: billingPortalSpy(() => {}),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('MASTERCARD ending 4444')).toBeVisible();
    await expect(canvas.queryByText(/^Expires/)).toBeNull();
  },
};
