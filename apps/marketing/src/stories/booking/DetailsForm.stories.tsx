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
          'Step 3 — the demographics Linus needs to interpret a result. `patientIdentification` ' +
          'carries over from signup and changes both the header copy and the fields: booking ' +
          'for someone else adds a patient name row, because everything below describes the ' +
          'person being assessed rather than the buyer. This is the longest step, so it is the ' +
          'one where `StickyActions` earns its keep — scroll the panel and the submit stays put.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    action: detailsSucceeds(),
    name: 'Margaret',
    patientIdentification: 'Self',
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

/** Booking for yourself — no patient name row. */
export const Default: Story = {};

/**
 * Booking for someone else: a patient name row leads the form and the subtitle
 * switches to "the person receiving care".
 */
export const ForSomeoneElse: Story = {
  args: { patientIdentification: 'Someone else' },
};

/** No name yet — the header falls back to a bare "Welcome". */
export const WithoutName: Story = {
  args: { name: '' },
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
      stateOfResidence: 'Select a state of residence.',
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
      canvas.getByText('Select a state of residence.'),
    ).toBeInTheDocument();
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
      stateOfResidence: 'Select a state of residence.',
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
    const phone = canvas.getByLabelText('Phone number');
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
