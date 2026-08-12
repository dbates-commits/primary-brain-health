import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { SignupForm } from "@pbh/booking";
import { BookingModalShell } from "./BookingModalShell";
import {
  SLOW_ACTION_DELAY_MS,
  signupFails,
  signupFieldErrors,
  signupSucceeds,
} from "./mock-actions";

const meta = {
  title: 'Booking/SignupForm',
  component: SignupForm,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The first step of the booking flow — the account holder&rsquo;s name and email. ' +
          'It ships on the marketing page rather than in the modal (see Booking/BookingSection), ' +
          'so `sticky={false}` is the shipping configuration; the sticky variant is kept for ' +
          'any host that scrolls. The server action arrives as the `action` prop, so these ' +
          'stories pass a stand-in from `mock-actions.ts` rather than the real ' +
          '`"use server"` module. It no longer asks who the assessment is for: the details ' +
          'step&rsquo;s name fields are prefilled from here and edited instead.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    action: signupSucceeds(),
    onComplete: fn(),
  },
  decorators: [
    (Story) => (
      <BookingModalShell>
        <Story />
      </BookingModalShell>
    ),
  ],
} satisfies Meta<typeof SignupForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The step with its own header inline, and the sticky action bar a modal wants. */
export const Default: Story = {};

/**
 * How it actually ships: inside the white card on the booking section, where the
 * container doesn&rsquo;t scroll — so the action bar must not stick, and the
 * header comes from the section around it.
 */
export const OnPageCard: Story = {
  args: {
    showHeader: false,
    sticky: false,
    submitLabel: 'Book Your Assessment and Consultation',
    submitLabelShort: 'Book Assessment',
  },
};

/** Per-field messages from the server, with the typed values preserved. */
export const FieldErrors: Story = {
  args: {
    action: signupFieldErrors({
      firstName: 'Enter a first name.',
      email: 'That email address looks incomplete.',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('First Name'), 'Margaret');
    await userEvent.type(canvas.getByLabelText('Last Name'), 'Hale');
    await userEvent.type(canvas.getByLabelText('Email'), 'margaret@example');
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await waitFor(async () => {
      await expect(canvas.getByText('Enter a first name.')).toBeInTheDocument();
    });
    // The values survive React 19's post-action form reset.
    await expect(canvas.getByLabelText('Last Name')).toHaveValue('Hale');
  },
};

/** A failure with no field to blame renders the form-level alert instead. */
export const FormLevelError: Story = {
  args: {
    action: signupFails('We couldn’t create your account. Please try again.'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('First Name'), 'Margaret');
    await userEvent.type(canvas.getByLabelText('Last Name'), 'Hale');
    await userEvent.type(canvas.getByLabelText('Email'), 'margaret@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await waitFor(async () => {
      await expect(canvas.getByRole('alert')).toBeInTheDocument();
    });
  },
};

/** In flight: the fieldset dims and disables, and the CTA reports progress. */
export const Submitting: Story = {
  args: { action: signupSucceeds(SLOW_ACTION_DELAY_MS) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('First Name'), 'Margaret');
    await userEvent.type(canvas.getByLabelText('Last Name'), 'Hale');
    await userEvent.type(canvas.getByLabelText('Email'), 'margaret@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Creating account…' }),
      ).toBeInTheDocument();
    });
  },
};

/** Host-supplied copy: the funnel and the modal word the CTA differently. */
export const CustomCopy: Story = {
  args: {
    title: 'Let’s get started',
    subtitle: 'A few details and we’ll set up your account.',
    submitLabel: 'Create my account',
  },
};
