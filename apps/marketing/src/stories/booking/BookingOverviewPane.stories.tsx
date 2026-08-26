import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { findBannedTerms } from "@pbh/copy";
import { BookingOverviewPane } from "@/components/booking/BookingOverviewPane";

const meta = {
  title: 'Booking/BookingOverviewPane',
  component: BookingOverviewPane,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'What the booking modal shows before its steps (Figma 2063:583): where you are, ' +
          'what is left, and one button into the next thing. Shown on every open until the ' +
          'booking is finished. ' +
          'It greets by state, not by identity — "Welcome!" while nothing is behind you, ' +
          '"Welcome Back!" once anything is. That test never asks whether a cookie exists, ' +
          'which matters because the booking cookie is HttpOnly: the honest answer for no ' +
          'cookie, an expired one and a deleted account alike is "no progress", which reads ' +
          'as a first visit. ' +
          'Only Details is re-enterable. Consent writes append-only rows nothing stops it ' +
          'duplicating (pbh-3u1) and Payment mints a Stripe session per mount with no ' +
          'already-paid guard (pbh-ypf), so their rows render nothing clickable at all — ' +
          'no disabled button, nothing focusable, no click to refuse.',
      },
    },
  },
  tags: ['autodocs'],
  args: { onStart: fn(), onSelectStep: fn() },
  decorators: [
    (Story) => (
      // The modal's panel width, so the rows wrap the way they really do.
      <div className="mx-auto max-w-2xl rounded-3xl bg-surface p-6 shadow-2xl sm:p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BookingOverviewPane>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing behind them yet, still at the email gate. */
export const FirstTime: Story = {
  args: { furthestStep: 'confirm', activeStep: 'confirm' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { name: 'Welcome!' }),
    ).toBeVisible();
    await expect(canvas.getByText('Complete Personal Information')).toBeVisible();
    await expect(canvas.getByText('Start Assessments')).toBeVisible();
    // The gate has no row of its own, so the button must still name the thing
    // they can actually do — never offer an unreachable action.
    await expect(
      canvas.getByRole('button', { name: 'Confirm Your Email' }),
    ).toBeEnabled();
    // Nothing is complete, so nothing is re-enterable.
    await expect(canvas.queryByRole('button', { name: /edit/i })).toBeNull();
  },
};

/** Figma's exact state: details done, consent next. */
export const WelcomeBack: Story = {
  args: { furthestStep: 'consent', activeStep: 'consent' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { name: 'Welcome Back!' }),
    ).toBeVisible();

    const rows = canvas.getAllByRole('listitem');
    await expect(rows[0]).toHaveTextContent('Completed');
    await expect(rows[1].querySelector('[aria-current="step"]')).not.toBeNull();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Sign Consent Form' }),
    );
    await expect(args.onStart).toHaveBeenCalledTimes(1);
  },
};

/**
 * Two steps behind them, and only one of the two is a control. This is the
 * story that would catch consent or payment quietly becoming clickable.
 */
export const DetailsIsTheOnlyReenterableStep: Story = {
  args: { furthestStep: 'payment', activeStep: 'payment' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    // The details edit and the CTA. Nothing else in the pane is pressable.
    await expect(canvas.getAllByRole('button')).toHaveLength(2);
    await expect(canvas.queryByRole('button', { name: /Consent/ })).toBeNull();
    await expect(canvas.queryByRole('button', { name: /Assessment/ })).toBeNull();

    await userEvent.click(
      canvas.getByRole('button', { name: /Personal Information.*edit/i }),
    );
    await expect(args.onSelectStep).toHaveBeenCalledWith('details');
  },
};

/**
 * Back in Details from Payment. Payment reads "upcoming" rather than "current",
 * which is right from where they now stand — but it is a choice, so it is pinned.
 */
export const BackInDetails: Story = {
  args: { furthestStep: 'payment', activeStep: 'details' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = canvas.getAllByRole('listitem');
    await expect(rows[0].querySelector('[aria-current="step"]')).not.toBeNull();
    await expect(rows[2]).toHaveTextContent('Not started');
    // Details is the step on screen, so it is current — not an edit affordance.
    await expect(canvas.queryByRole('button', { name: /edit/i })).toBeNull();
  },
};

/**
 * The wellness-track copy sweep. These strings ship in code — the overview has
 * no Modals document, because `MODAL_STEPS` is asserted against the four on
 * disk — so `content/modal-copy.test.ts` cannot see them and this is their only
 * compliance guard.
 */
export const CopyIsCompliant: Story = {
  args: { furthestStep: 'consent', activeStep: 'consent' },
  play: async ({ canvasElement }) => {
    await expect(
      findBannedTerms(
        canvasElement.textContent ?? '',
        'BookingOverviewPane rendered text',
      ),
    ).toEqual([]);
  },
};
