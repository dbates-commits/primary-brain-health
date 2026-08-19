import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { AccountCard } from "@/components/account/AccountCard";

const meta = {
  title: 'Account/AccountCard',
  component: AccountCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The box every card on the account page sits in — white, 12px radius, a ' +
          '`border/subtle` hairline (Figma 2092:13144 and siblings). It is deliberately ' +
          'nothing else: headings, rules and bodies belong to each card, so the four cards ' +
          'can be built independently. **Its API is frozen at `{ children, className }`.** ' +
          'The moment the shell grows props, every card owner has a reason to edit this ' +
          'one file — which is the thing it exists to prevent. Padding is the only ' +
          'variation the design has, and `className` already covers it.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    children: 'Card contents go here.',
  },
} satisfies Meta<typeof AccountCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 32px padding — the three cards in the right-hand column. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Card contents go here.')).toBeVisible();
  },
};

/**
 * 28px padding — the plan card, the one place the design differs. `className`
 * wins over the default because `cn` is tailwind-merge.
 */
export const PlanPadding: Story = {
  args: { className: 'p-7' },
};
