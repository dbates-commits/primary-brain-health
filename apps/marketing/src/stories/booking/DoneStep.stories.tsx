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
          'completed, and the last screen we own. It renders `EngagementAppCta`, whose ' +
          'button links out to the Linus Engagement App. That link comes from ' +
          '`NEXT_PUBLIC_ENGAGEMENT_APP_URL`, inlined at build time: with it unset (as in ' +
          'Storybook) the confirmation renders without a button and promises the link by ' +
          'email instead, rather than showing a dead one to someone who has just paid.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    email: 'margaret@example.com',
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

/** The confirmation, addressed to the account that just paid. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/You're all set/)).toBeInTheDocument();
    await expect(
      canvas.getByText(/margaret@example\.com/),
    ).toBeInTheDocument();
  },
};

/** No email on hand — the copy drops the address rather than leaving a gap. */
export const WithoutEmail: Story = {
  args: { email: '' },
};

/** A long address still wraps inside the copy rather than overflowing. */
export const LongEmail: Story = {
  args: {
    email: 'margaret.hale.longaddress@a-very-long-domain-name.example.com',
  },
};
