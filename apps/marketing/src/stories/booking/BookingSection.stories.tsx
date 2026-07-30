import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { BookingSection } from "@/components/booking/BookingSection";

const meta = {
  title: 'Booking/BookingSection',
  component: BookingSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The booking landing section: centred header, the two package cards side by side, ' +
          'then the full-width HSA/FSA note. There is no inline signup form — each card’s CTA ' +
          'opens the booking modal, which starts at signup. The cards are read from ' +
          '`ASSESSMENT_PACKAGES` rather than passed in, so only the headline and subheadline ' +
          'are props (the Tina block binds them).',
      },
    },
  },
  tags: ['autodocs'],
  args: { onSelectPackage: fn() },
} satisfies Meta<typeof BookingSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The design defaults, used whenever the CMS leaves the fields empty. */
export const Default: Story = {};

/** Headline and subheadline bound from Tina. */
export const CustomCopy: Story = {
  args: {
    headline: 'Know where your cognition stands today',
    subheadline:
      'A validated baseline, reviewed by a clinician, with a plan built around what it tells you.',
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

/** Choosing a package reports the whole package object, not just its key. */
export const SelectingAPackage: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Book Basic Assessment' }),
    );
    await expect(args.onSelectPackage).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'basic' }),
    );
  },
};
