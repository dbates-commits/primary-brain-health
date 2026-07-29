import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { PaymentStep } from "@pbh/booking";
import { BookingModalShell } from "./BookingModalShell";
import { checkoutFails, checkoutPending, finalizeSucceeds } from "./mock-actions";

const meta = {
  title: 'Booking/PaymentStep',
  component: PaymentStep,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Step 5 — Stripe Embedded Checkout. **No story here mounts the card form, and none ' +
          'can.** Checkout renders in a cross-origin iframe from a real Checkout Session, ' +
          'which only a server holding the secret key can mint; a fake `clientSecret` makes ' +
          'Stripe mount and then fail. So these stories cover the states *around* Checkout — ' +
          'what the step shows before and instead of it. Exercising the paid path belongs to ' +
          'the E2E test (`pnpm test:e2e`), not to Storybook. ' +
          'One environment note: the step reads `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` at ' +
          'module scope, so with `.env.local` loaded you see the states below, and with no ' +
          'key you get the "Payments aren’t configured" notice in their place. Only ' +
          '**Session Error** renders identically either way, so it is the only story that ' +
          'asserts.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    createSession: checkoutPending(),
    finalize: finalizeSucceeds,
    onComplete: fn(),
  },
  decorators: [
    (Story) => (
      <BookingModalShell>
        <Story />
      </BookingModalShell>
    ),
  ],
} satisfies Meta<typeof PaymentStep>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Waiting on the Checkout Session — what the customer sees for the moment
 * between opening the step and Stripe taking over.
 *
 * It stays here indefinitely on purpose: the session is deliberately left
 * unresolved so the state holds still to be looked at. That is the story
 * working, not hanging. Nothing further can render without a real session.
 */
export const LoadingSession: Story = {};

/**
 * The session failed to mint — Stripe is never reached and the reason replaces
 * the form. Independent of whether a publishable key is set.
 */
export const SessionError: Story = {
  args: {
    createSession: checkoutFails(
      'We couldn’t start the payment. Please try again.',
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(async () => {
      await expect(
        canvas.getByText('We couldn’t start the payment. Please try again.'),
      ).toBeInTheDocument();
    });
  },
};
