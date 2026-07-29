import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { SignupForm, SIGNUP_HEADER } from "@pbh/booking";
import { StepHeader } from "@pbh/ui";
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
          'Step 1 of the booking flow — who the consultation is for, plus the *buyer&rsquo;s* ' +
          'name and email. The server action arrives as the `action` prop, so these stories ' +
          'pass a stand-in from `mock-actions.ts` instead of the real `"use server"` module. ' +
          'The "who is this for" answer decides how step 3 is worded, and picking "Someone ' +
          'Else" adds a line clarifying that these fields still describe the account holder.',
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

/** The step as the funnel renders it, with its own header inline. */
export const Default: Story = {};

/**
 * How the marketing modal renders it: `showHeader={false}`, with the same
 * `SIGNUP_HEADER` copy pinned in the modal&rsquo;s fixed header region above the
 * scroll area.
 */
export const InModal: Story = {
  args: { showHeader: false },
  decorators: [
    (Story) => (
      <BookingModalShell header={<StepHeader {...SIGNUP_HEADER} />}>
        <Story />
      </BookingModalShell>
    ),
  ],
};

/**
 * Choosing "Someone Else" adds the line explaining that the name and email below
 * are still the buyer&rsquo;s — the patient is named on the details step.
 */
export const BookingForSomeoneElse: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Someone Else'));
    await expect(
      canvas.getByText('Please enter your personal information'),
    ).toBeInTheDocument();
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
