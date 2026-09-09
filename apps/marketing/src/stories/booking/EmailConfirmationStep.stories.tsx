import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { EmailConfirmationStep } from "@/components/booking/EmailConfirmationStep";
import { BookingModalShell } from "./BookingModalShell";
import { verifyEmailAction } from "./booking-actions.mock";

const meta = {
  title: 'Booking/EmailConfirmationStep',
  component: EmailConfirmationStep,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The "address not proven yet" screen. Rarely seen: signup redirects straight to ' +
          'Auth0, so this is what someone lands on only if they abandoned there and came ' +
          'back on their booking cookie. The button starts the Auth0 flow again. ' +
          'Takes its action as a prop like every other step, so these stories inject the ' +
          'stand-in from `booking-actions.mock.ts` directly — the real one redirects out ' +
          'to Auth0 and never resolves.',
      },
    },
  },
  tags: ['autodocs'],
  args: { verify: verifyEmailAction },
  decorators: [
    (Story) => (
      <BookingModalShell sizeToContent>
        <Story />
      </BookingModalShell>
    ),
  ],
} satisfies Meta<typeof EmailConfirmationStep>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Came back without a verified address: one thing to do. */
export const Default: Story = {};

/** Mid-request: the button is disabled while the redirect is being prepared. */
export const Verifying: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Send me a code' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'One moment…' }),
    ).toBeDisabled();
  },
};
