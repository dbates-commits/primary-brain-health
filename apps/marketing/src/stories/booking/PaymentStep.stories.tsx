import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { PaymentStep, PAYMENT_HEADER } from "@pbh/booking";
import { StepHeader } from "@pbh/ui";
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
          'Step 5 — Stripe Embedded Checkout. **The card form itself does not mount here.** ' +
          'Checkout is a cross-origin iframe driven by a real Checkout Session, which belongs ' +
          'to the E2E test rather than to a story; these stories cover the states *around* it. ' +
          'Note that the branch this step takes depends on the environment: `PaymentStep` ' +
          'reads `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` at module scope, so with `.env.local` ' +
          'loaded you get the session-loading state, and without a key you get the ' +
          '"Payments aren’t configured" notice instead. Only **Session Error** renders the ' +
          'same either way, so it is the only story that asserts.',
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
 * Waiting on the Checkout Session. With a publishable key configured this is
 * "Loading payment…"; without one it is the configuration notice.
 */
export const Default: Story = {};

/** As the marketing modal renders it, with `PAYMENT_HEADER` pinned above. */
export const InModal: Story = {
  args: { showHeader: false },
  decorators: [
    (Story) => (
      <BookingModalShell header={<StepHeader {...PAYMENT_HEADER} />}>
        <Story />
      </BookingModalShell>
    ),
  ],
};

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
