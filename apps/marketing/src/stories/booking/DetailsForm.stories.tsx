import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DetailsForm } from "@pbh/booking";
import { BookingModalShell } from "./BookingModalShell";
import {
  SLOW_ACTION_DELAY_MS,
  detailsFails,
  detailsFieldErrors,
  detailsSucceeds,
} from "./mock-actions";

const meta = {
  title: 'Booking/DetailsForm',
  component: DetailsForm,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The demographics Linus needs to interpret a result (Figma 1642:3213). Every field ' +
          'describes the person being assessed, and the name row leads the form prefilled with ' +
          'the account holder&rsquo;s name — so booking for yourself is a no-op and booking for ' +
          'a parent or spouse is an edit rather than a separate question. This is the longest ' +
          'step, so it is where `StickyActions` earns its keep: scroll the panel and the submit ' +
          'stays put.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    action: detailsSucceeds(),
    firstName: 'Margaret',
    lastName: 'Hale',
    onComplete: fn(),
  },
  decorators: [
    (Story) => (
      <BookingModalShell>
        <Story />
      </BookingModalShell>
    ),
  ],
} satisfies Meta<typeof DetailsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Booking for yourself: the name arrives filled in and is left alone. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('First Name')).toHaveValue('Margaret');
    await expect(canvas.getByLabelText('Last Name')).toHaveValue('Hale');
  },
};

/**
 * Booking for someone else — which is not a separate mode, just typing over the
 * prefilled name. Everything below then describes that person.
 */
export const EditedForSomeoneElse: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByLabelText('First Name');
    await userEvent.clear(first);
    await userEvent.type(first, 'Frederick');
    await expect(first).toHaveValue('Frederick');
  },
};

/**
 * Every field carrying a server-side message at once — the three `<select>`s
 * included, since they are as easy to leave unanswered as the text inputs.
 */
export const FieldErrors: Story = {
  args: {
    action: detailsFieldErrors({
      dateOfBirth: 'Enter a date of birth.',
      gender: 'Select a gender.',
      zip: 'Enter a 5-digit ZIP code.',
      phone: 'Enter a 10-digit phone number.',
      educationLevel: 'Select a level of education.',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await waitFor(async () => {
      await expect(canvas.getByText('Enter a date of birth.')).toBeInTheDocument();
    });
    // The selects report through the same FieldError as the inputs.
    await expect(canvas.getByText('Select a gender.')).toBeInTheDocument();
    await expect(
      canvas.getByText('Select a level of education.'),
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText('Gender')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  },
};

/**
 * Only the selects are wrong — the case that shows they are reachable on their
 * own, not just as collateral in a whole-form failure.
 */
export const SelectErrorsOnly: Story = {
  args: {
    action: detailsFieldErrors({
      gender: 'Select a gender.',
      educationLevel: 'Select a level of education.',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await waitFor(async () => {
      await expect(canvas.getByText('Select a gender.')).toBeInTheDocument();
    });
  },
};

/** A failure with no field attached renders the form-level alert. */
export const FormLevelError: Story = {
  args: {
    action: detailsFails('We couldn’t save your details. Please try again.'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await waitFor(async () => {
      await expect(canvas.getByRole('alert')).toBeInTheDocument();
    });
  },
};

/** Phone input formats to `(XXX) XXX-XXXX` as you type. */
export const PhoneFormatting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const phone = canvas.getByLabelText('Phone Number');
    await userEvent.type(phone, '6175550142');
    await expect(phone).toHaveValue('(617) 555-0142');
  },
};

/** In flight: the fieldset dims and the CTA reports progress. */
export const Submitting: Story = {
  args: { action: detailsSucceeds(SLOW_ACTION_DELAY_MS) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Saving…' }),
      ).toBeInTheDocument();
    });
  },
};

/**
 * Re-entering the step from the stepper, with the row already filled.
 *
 * Without `initialValues` the form comes up blank however much is stored, and
 * `validateProfileFields` then refuses to submit it — so a customer going back
 * to fix one field would have to retype five. This is the story that pins the
 * prefill.
 */
export const Prefilled: Story = {
  args: {
    initialValues: {
      dateOfBirth: '1962-04-18',
      zip: '02116',
      phone: '(617) 555-0142',
      // The canonical values, not display labels — `normalizeGender` and
      // `normalizeEducationLevel` are what `getBookingDetailsValues` runs the
      // row through, and anything outside these sets fails Linus registration.
      gender: 'FEMALE',
      educationLevel: 'ED_YEARS_16',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Birthday')).toHaveValue('1962-04-18');
    await expect(canvas.getByLabelText('ZIP Code')).toHaveValue('02116');
    await expect(canvas.getByLabelText('Phone Number')).toHaveValue(
      '(617) 555-0142',
    );
    await expect(canvas.getByLabelText('Gender')).toHaveValue('FEMALE');
    await expect(
      canvas.getByLabelText('Highest Level of education'),
    ).toHaveValue('ED_YEARS_16');
  },
};
