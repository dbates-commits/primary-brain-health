import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { findBannedTerms } from "@pbh/copy";
import { BookingStepper } from "@/components/booking/BookingStepper";

const meta = {
  title: 'Booking/BookingStepper',
  component: BookingStepper,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The four-tab progress band above the booking modal (Figma 2060:5600), mounted ' +
          "through `Modal`'s `banner` slot — the header region is inset by `px-6 … sm:px-8` " +
          'with a `pr-14` gutter, which a bordered full-bleed band cannot live inside. ' +
          'A `<nav>`, not a `role="tablist"`. ARIA tabs promise that every tab is ' +
          'selectable, that arrow keys move between them, and that `aria-selected` means a ' +
          'panel is now shown. Three of these four are permanently inert, the panels are a ' +
          'linear wizard with server writes between them, and the meaning being conveyed is ' +
          'progress — which `aria-current="step"` states and `aria-selected` does not. ' +
          'An inert tab is a plain span with nothing focusable, so the dialog focus trap ' +
          "(which selects `button:not([disabled])`) skips it and there is no arrow-key " +
          'contract to document.',
      },
    },
  },
  tags: ['autodocs'],
  args: { onSelectStep: fn() },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-surface shadow-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BookingStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Queried by attribute, and matched loosely: the captions wrap onto two lines. */
function current(canvasElement: HTMLElement): Element | null {
  return canvasElement.querySelector('[aria-current="step"]');
}

export const AtDetails: Story = {
  args: { furthestStep: 'details', activeStep: 'details' },
  play: async ({ canvasElement }) => {
    await expect(current(canvasElement)).toHaveTextContent(/Personal\s*Information/);
    // Nothing is behind them, so nothing is re-enterable.
    await expect(within(canvasElement).queryAllByRole('button')).toHaveLength(0);
  },
};

export const AtConsent: Story = {
  args: { furthestStep: 'consent', activeStep: 'consent' },
  play: async ({ canvasElement }) => {
    await expect(current(canvasElement)).toHaveTextContent(/Sign\s*Consent Form/);
  },
};

export const AtPayment: Story = {
  args: { furthestStep: 'payment', activeStep: 'payment' },
  play: async ({ canvasElement }) => {
    await expect(current(canvasElement)).toHaveTextContent(/Complete\s*Payment Details/);
  },
};

/**
 * The real a11y assertion: an inert tab is not merely styled as unavailable, it
 * is not in the tab order at all. A disabled button would announce itself and
 * invite a press that does nothing.
 */
export const LockedTabsAreNotFocusable: Story = {
  args: { furthestStep: 'payment', activeStep: 'payment' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(1);

    buttons[0].focus();
    await expect(buttons[0]).toHaveFocus();
    await userEvent.tab();
    await expect(buttons[0]).not.toHaveFocus();
  },
};

export const ReenterDetails: Story = {
  args: { furthestStep: 'payment', activeStep: 'payment' },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: /Personal Information.*edit/i,
      }),
    );
    await expect(args.onSelectStep).toHaveBeenCalledWith('details');
  },
};

/** Same sweep as the overview pane — this copy ships in code, not in the CMS. */
export const CopyIsCompliant: Story = {
  args: { furthestStep: 'consent', activeStep: 'consent' },
  play: async ({ canvasElement }) => {
    await expect(
      findBannedTerms(
        canvasElement.textContent ?? '',
        'BookingStepper rendered text',
      ),
    ).toEqual([]);
  },
};
