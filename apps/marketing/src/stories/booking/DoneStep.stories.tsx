import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { DoneStep } from "@/components/booking/DoneStep";
import { BookingModalShell } from "./BookingModalShell";

const meta = {
  title: 'Booking/DoneStep',
  component: DoneStep,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Step 6 — the confirmation shown once payment and Linus enrollment have both ' +
          'completed. Its job is the handoff: `handoffUrl` is a single-use sign-in link that ' +
          'lands the customer on `/assessments` already authenticated. When that link ' +
          'couldn’t be minted the step falls back to `/login` with the email prefilled, which ' +
          'always works — so the customer is never stranded on a dead end after paying.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    email: 'margaret@example.com',
    handoffUrl: 'https://app.example.com/handoff?token=stub',
    onClose: fn(),
  },
  decorators: [
    (Story) => (
      <BookingModalShell>
        <Story />
      </BookingModalShell>
    ),
  ],
} satisfies Meta<typeof DoneStep>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The happy path: a minted handoff link straight into the assessments. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('link', { name: 'Continue to your assessments' }),
    ).toHaveAttribute('href', 'https://app.example.com/handoff?token=stub');
  },
};

/**
 * The handoff couldn&rsquo;t be minted, so the CTA falls back to `/login` with
 * the email prefilled.
 */
export const WithoutHandoffLink: Story = {
  args: { handoffUrl: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('link', { name: 'Continue to your assessments' }),
    ).toHaveAttribute(
      'href',
      expect.stringContaining('/login?email=margaret%40example.com'),
    );
  },
};

/** No email on hand — the subtitle drops the address and the prefill goes too. */
export const WithoutEmail: Story = {
  args: { email: '', handoffUrl: null },
};

/** A long address still wraps inside the subtitle rather than overflowing. */
export const LongEmail: Story = {
  args: {
    email: 'margaret.hale.longaddress@a-very-long-domain-name.example.com',
  },
};
