import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ConsentForm } from "@pbh/booking";
import { BookingModalShell } from "./BookingModalShell";
import {
  SLOW_ACTION_DELAY_MS,
  consentFails,
  consentSucceeds,
} from "./mock-actions";

const meta = {
  title: 'Booking/ConsentForm',
  component: ConsentForm,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Step 4 — the terms panel and the agreement gate. The terms scroll inside their own ' +
          'region while the checkbox and the CTA stay pinned, because the checkbox is what ' +
          'enables the submit and scrolling it away would strand the user. The submit button ' +
          'is never disabled: clicking it unticked surfaces *why* it can’t proceed, and the ' +
          'server re-checks with the same message. The terms copy is still placeholder text — ' +
          'real wellness + HIPAA NPP wording lands with the compliance task.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    action: consentSucceeds(),
    track: 'wellness',
    onComplete: fn(),
  },
  decorators: [
    (Story) => (
      <BookingModalShell>
        <Story />
      </BookingModalShell>
    ),
  ],
} satisfies Meta<typeof ConsentForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The step as the funnel renders it, header inline. */
export const Default: Story = {};

/**
 * The clinical package's consent step. The subtitle names the consultation the
 * clinical product includes; the wellness one must not, since consenting to a
 * consultation that was never sold is the misdescription this whole track axis
 * exists to prevent.
 */
export const ClinicalTrack: Story = {
  args: { track: 'clinical' },
};

/** Ticked and ready — the state the CTA is meant to be pressed in. */
export const Agreed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByLabelText('I’ve read and agree to the consent form.'),
    );
    await expect(
      canvas.getByRole('checkbox', {
        name: 'I’ve read and agree to the consent form.',
      }),
    ).toBeChecked();
  },
};

/**
 * Submitting unticked. The client guard fires instantly rather than
 * round-tripping to learn what it already knows.
 */
export const AgreementRequired: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Continue With Payment' }),
    );
    await expect(
      canvas.getByText('You must agree to the terms to continue.'),
    ).toBeInTheDocument();
  },
};

/** Ticked, but the server write failed — the form-level alert. */
export const ServerError: Story = {
  args: {
    action: consentFails('We couldn’t record your consent. Please try again.'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByLabelText('I’ve read and agree to the consent form.'),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Continue With Payment' }),
    );
    await waitFor(async () => {
      await expect(canvas.getByRole('alert')).toBeInTheDocument();
    });
  },
};

/** In flight: the fieldset dims and the CTA reports progress. */
export const Submitting: Story = {
  args: { action: consentSucceeds(SLOW_ACTION_DELAY_MS) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByLabelText('I’ve read and agree to the consent form.'),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Continue With Payment' }),
    );
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Saving…' }),
      ).toBeInTheDocument();
    });
  },
};
