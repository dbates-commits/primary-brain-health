import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { BookingSection } from "@/components/booking/BookingSection";
import { signupSucceeds } from "./mock-actions";

const meta = {
  title: 'Booking/BookingSection',
  component: BookingSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The booking landing section (Figma 1804:17908): headline, subheadline and the ' +
          'signup form in a white card on the left; what the assessment includes and its ' +
          'price on the right. The form is on the page rather than behind a CTA, so this ' +
          'section is the first step of the flow — submitting it creates the account and the ' +
          'host opens the modal at the confirmation gate. The bullets and price come from ' +
          '`ASSESSMENT_PACKAGES`, not from props, so they cannot drift from what checkout ' +
          'charges; only the headline, subheadline and button label are CMS-bound.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    action: signupSucceeds(),
    onSignupComplete: fn(),
    signedUp: false,
    onReopen: fn(),
  },
} satisfies Meta<typeof BookingSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The design defaults, used whenever the CMS leaves the fields empty. */
export const Default: Story = { args: {} };

/** Headline, subheadline and button label bound from Tina. */
export const CustomCopy: Story = {
  args: {
    headline: 'Know where your cognition stands today',
    subheadline:
      'A validated baseline, reviewed by a clinician, with a plan built around what it tells you.',
    buttonText: 'Book Your Assessment and Consultation',
    buttonTextShort: 'Book Assessment',
  },
};

/** Long copy — checks the header balances rather than running to the edges. */
export const LongCopy: Story = {
  args: {
    headline:
      'A measured, clinician-led approach to understanding your brain health as you age',
    subheadline:
      'Most cognitive change begins two decades before symptoms appear. A validated baseline tells you where you stand now and what is worth acting on, reviewed by a clinician rather than an algorithm, with a plan you can actually follow.',
  },
};

/**
 * Tina&rsquo;s "Show Includes panel" toggle turned off — the one-column variant
 * for pages where the form is a general enquiry rather than this purchase.
 */
export const WithoutIncludes: Story = {
  args: { showIncludes: false },
};

/**
 * After a successful signup. The form is deliberately gone: an account now
 * exists, so a second submit could only fail on the unique-email constraint.
 */
export const AfterSignup: Story = {
  args: { signedUp: true },
};

/** Submitting the form reports the account back to the host, which opens the modal. */
export const SubmittingTheForm: Story = {
  args: {},
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('First Name'), 'Margaret');
    await userEvent.type(canvas.getByLabelText('Last Name'), 'Hale');
    await userEvent.type(canvas.getByLabelText('Email'), 'margaret@example.com');
    await userEvent.click(canvas.getByRole('button', { name: /continue/i }));
    await waitFor(async () => {
      await expect(args.onSignupComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Margaret',
          lastName: 'Hale',
          email: 'margaret@example.com',
        }),
      );
    });
  },
};
