import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { DEFAULT_PACKAGE } from "@pbh/booking";
import { findBannedTerms } from "@pbh/copy";
import { AccountCard } from "@/components/account/AccountCard";
import { PlanSummary } from "@/components/account/PlanSummary";
import type { CurrentPlan } from "@/lib/plan";

/**
 * Built from the catalog rather than retyped, so a story can never assert copy
 * the product doesn't actually sell. The price is what `getCurrentPlan` derives
 * from a $149 charge.
 */
const BASIC: CurrentPlan = {
  price: '$149',
  name: DEFAULT_PACKAGE.name,
  includes: DEFAULT_PACKAGE.includes,
};

const meta = {
  title: 'Account/PlanSummary',
  component: PlanSummary,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The body of the Current Plan card (Figma 1917:7817). Everything it renders comes ' +
          "from `ASSESSMENT_PACKAGES`, not from the design: Figma's plan name and two of its " +
          'six bullets carry clinical vocabulary that `CLINICAL_ONLY_PATTERNS` bans on a ' +
          'wellness purchase. `PlanCard` is the async half that reads the payment row.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      // The real shell, at the plan card's 28px padding.
      <div className="max-w-[484px]">
        <AccountCard className="p-7 md:p-7">
          <Story />
        </AccountCard>
      </div>
    ),
  ],
} satisfies Meta<typeof PlanSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A paid account: badge, price, plan name and the catalog's deliverables. */
export const Active: Story = {
  args: { plan: BASIC },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Active')).toBeVisible();
    await expect(canvas.getByText('$149')).toBeVisible();
    await expect(
      canvas.getByRole('heading', { name: DEFAULT_PACKAGE.name }),
    ).toBeVisible();

    for (const item of DEFAULT_PACKAGE.includes) {
      await expect(canvas.getByText(item.text)).toBeVisible();
    }
  },
};

/**
 * The card's own compliance guard.
 *
 * `findBannedTerms` runs against the lexicon, the catalog and the Tina modals,
 * but nothing enforces it on a React component — and this card is the one most
 * likely to have Figma's wording pasted back into it, since the design shows
 * "Clinician review of results" and "…& Consultation" verbatim.
 */
export const CopyIsCompliant: Story = {
  args: { plan: BASIC },
  play: async ({ canvasElement }) => {
    const hits = findBannedTerms(
      canvasElement.textContent ?? '',
      'PlanSummary rendered text',
    );
    await expect(hits).toEqual([]);
  },
};

/**
 * No succeeded payment — never paid, or refunded. The card holds its slot in
 * the grid and points at the booking flow; an absent card would read as a
 * loading failure on a page the customer reached deliberately.
 */
export const NoPlan: Story = {
  args: { plan: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('CURRENT PLAN')).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: 'Book an assessment' }),
    ).toBeVisible();
    // The badge is the thing that must not survive an empty plan.
    await expect(canvas.queryByText('Active')).toBeNull();
  },
};
