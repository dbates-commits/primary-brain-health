import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PricingTable } from "@/components/blocks/PricingTable";
import { PRICING_TIERS } from "../fixtures";

const meta = {
  title: 'Blocks/PricingTable',
  component: PricingTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '**Currently parked, not wired into the site.** The component and `tina/blocks/' +
          'pricing.ts` exist, but the block is not registered in `tina/collections/page.ts` ' +
          'and `BlockRenderer` has no case for it — so it cannot be added to a page today. ' +
          'It is kept for the post-launch `/pricing` fast-follow; these stories are how you ' +
          'review it in the meantime.\n\n' +
          'Two things to know before authoring content for it: the component renders ' +
          '`${tier.price}`, so prices must **not** include a leading `$`; and the theme ' +
          'palette is still the starter indigo/gray scale rather than the Cognitive Sanctuary ' +
          'tokens, so it needs a design pass before it ships.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['cards', 'table', 'comparison'] },
    theme: { control: 'inline-radio', options: ['light', 'dark'] },
  },
} satisfies Meta<typeof PricingTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three-up cards — the default, and the layout the fast-follow most likely wants. */
export const Cards: Story = {
  args: {
    variant: 'cards',
    theme: 'light',
    headline: 'Straightforward pricing',
    subheadline: 'Self-pay, published up front. No insurance games.',
    tiers: PRICING_TIERS,
  },
};

/** `highlighted` scales the card up and inverts it; `badge` pins a label over the top edge. */
export const HighlightedTier: Story = {
  args: {
    ...Cards.args,
    tiers: PRICING_TIERS.map((tier, index) => ({ ...tier, highlighted: index === 0, badge: index === 0 ? 'Start here' : undefined })),
  },
};

/** No tier singled out — every card renders in the resting style. */
export const NoHighlight: Story = {
  args: {
    ...Cards.args,
    tiers: PRICING_TIERS.map((tier) => ({ ...tier, highlighted: false, badge: undefined })),
  },
};

/** Feature matrix. Rows are the union of every tier's features; a missing feature shows a dash. */
export const Comparison: Story = {
  args: {
    ...Cards.args,
    variant: 'comparison',
  },
};

/** The fallback layout — any `variant` other than `cards` or `comparison` lands here. */
export const Table: Story = {
  args: {
    ...Cards.args,
    variant: 'table',
  },
};

/** The table variant truncates to three features and appends a "+N more" count. */
export const TableWithManyFeatures: Story = {
  args: {
    ...Cards.args,
    variant: 'table',
    tiers: PRICING_TIERS.map((tier) => ({
      ...tier,
      features: [...(tier.features ?? []), 'Annual summary letter', 'Care navigator check-ins'],
    })),
  },
};

export const DarkTheme: Story = {
  args: {
    ...Cards.args,
    theme: 'dark',
  },
};

/** `period: "once"` suppresses the `/period` suffix — used for the one-off assessment. */
export const OneTimePriceOnly: Story = {
  args: {
    ...Cards.args,
    headline: 'A single assessment',
    subheadline: undefined,
    tiers: [{ ...PRICING_TIERS[0], highlighted: true }],
  },
};

/** Header is optional. */
export const WithoutHeader: Story = {
  args: {
    variant: 'cards',
    tiers: PRICING_TIERS,
  },
};

/** Only `name` and `price` are required — everything else degrades. */
export const MinimalTiers: Story = {
  args: {
    variant: 'cards',
    headline: 'Straightforward pricing',
    tiers: PRICING_TIERS.map(({ name, price }) => ({ name, price })),
  },
};

/**
 * `showToggle` and `annualDiscount` are declared in `PricingTableProps` and offered by the
 * Tina schema, but the component never destructures them — setting either has no effect.
 * This story sets both to make that visible.
 */
export const InertProps: Story = {
  args: {
    ...Cards.args,
    showToggle: true,
    annualDiscount: 20,
  },
};
