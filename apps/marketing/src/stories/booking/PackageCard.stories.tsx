import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { ASSESSMENT_PACKAGES } from "@pbh/booking";
import { PackageCard } from "@/components/booking/PackageCard";

const [BASIC, COMPREHENSIVE] = ASSESSMENT_PACKAGES;

const meta = {
  title: 'Booking/PackageCard',
  component: PackageCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One assessment package card. The content comes from `ASSESSMENT_PACKAGES` in ' +
          '`@pbh/booking`, which is also what the server checkout reads — the copy a customer ' +
          'sees and the price they are charged cannot drift apart by editing only one of ' +
          'them. Note that `displayPrice` is marketing copy: the actual charge resolves from ' +
          'a Stripe Price, and Embedded Checkout shows that real amount before payment, so a ' +
          'stale value here is a copy bug rather than a billing one. ' +
          'Cards stretch to equal height with the CTA pinned via `mt-auto`, so two sit level ' +
          'even though Comprehensive carries an extra bullet.',
      },
    },
  },
  tags: ['autodocs'],
  args: { onSelect: fn() },
  decorators: [
    (Story) => (
      <div className="w-[26rem] bg-primary p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PackageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The $149 package, exactly as the catalog defines it. */
export const Basic: Story = {
  args: { pkg: BASIC },
};

/**
 * The $449 package. `accentChecks` turns the ticks green to set its extra
 * deliverables apart, while the emphasised first bullet — the callback to Basic
 * — keeps a white tick either way.
 */
export const Comprehensive: Story = {
  args: { pkg: COMPREHENSIVE },
};

/**
 * `purchasable: false` disables the CTA and explains itself rather than hiding
 * the card: the offer stays visible while the fulfillment behind it is still
 * being defined.
 */
export const NotYetPurchasable: Story = {
  args: { pkg: { ...COMPREHENSIVE, purchasable: false } },
};

/** A single bullet — the shortest the card can legitimately get. */
export const MinimalIncludes: Story = {
  args: {
    pkg: { ...BASIC, includes: BASIC.includes.slice(0, 1) },
  },
};

/**
 * Long bullet text wraps beside the tick instead of pushing it out of line.
 * The Navigator bullet is the longest the catalog carries, so this is sliced
 * from the real package rather than written out here — a hand-typed literal is
 * how the old "brain health specialist" wording outlived its removal from
 * `ASSESSMENT_PACKAGES`.
 */
export const LongIncludeText: Story = {
  args: {
    pkg: { ...BASIC, includes: BASIC.includes.slice(1, 3) },
  },
};
