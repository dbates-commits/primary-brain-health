import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { EmailConfirmationStep } from "@/components/booking/EmailConfirmationStep";
import { BookingModalShell } from "./BookingModalShell";
import { resendConfirmationAction } from "./booking-actions.mock";

const meta = {
  title: 'Booking/EmailConfirmationStep',
  component: EmailConfirmationStep,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Step 2 — the blocking screen after signup: we have emailed a confirmation link and ' +
          'the flow cannot continue until it is clicked. ' +
          'Takes its resend as a prop like every other step takes its action, so these ' +
          'stories inject the stand-in from `booking-actions.mock.ts` directly. ' +
          'Worth knowing about the resend: it always reports "Sent", even when the server ' +
          'throttled the request. Saying "too soon" would disclose how recently a link went ' +
          'out to that address, so the UI stays deliberately uninformative.',
      },
    },
  },
  tags: ['autodocs'],
  args: { resend: resendConfirmationAction },
  decorators: [
    (Story) => (
      <BookingModalShell>
        <Story />
      </BookingModalShell>
    ),
  ],
} satisfies Meta<typeof EmailConfirmationStep>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Straight after signup: check your inbox. */
export const Default: Story = {};

/**
 * Arriving back from a link that had already been used or had run out. Same
 * screen, different opening line, so a dead link never reads as a dead end.
 */
export const ExpiredLink: Story = {
  args: { expired: true },
};

/** Mid-resend: the link is disabled and reports progress. */
export const Resending: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Re-send confirmation email.' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Sending…' }),
    ).toBeDisabled();
  },
};

/** After the resend settles, the prompt is replaced by a live-region receipt. */
export const Resent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Re-send confirmation email.' }),
    );
    await waitFor(
      async () => {
        await expect(
          canvas.getByText(/Sent\. Check your inbox/),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  },
};
