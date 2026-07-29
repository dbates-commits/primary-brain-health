import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Stats } from "@/components/blocks/Stats";
import { STAT_ITEMS } from "../fixtures";

const meta = {
  title: 'Blocks/Stats',
  component: Stats,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Statistic band. All four variants are implemented. Note the theme palette here is ' +
          'still the starter indigo/gray scale rather than the Cognitive Sanctuary tokens — ' +
          'the `dark`, `primary`, and `gradient` themes will not match the rest of the site.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['counters', 'progress', 'icons', 'cards'] },
    theme: { control: 'inline-radio', options: ['light', 'dark', 'primary', 'gradient'] },
  },
} satisfies Meta<typeof Stats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Counters: Story = {
  args: {
    variant: 'counters',
    theme: 'light',
    headline: 'Why act early',
    subheadline: 'The numbers behind a baseline assessment.',
    items: STAT_ITEMS,
  },
};

/** `progress` reads `item.progress` (0–100) for the bar width; `value` sits on the right. */
export const Progress: Story = {
  args: {
    variant: 'progress',
    theme: 'light',
    headline: 'Where the time goes',
    items: STAT_ITEMS,
  },
};

/** `icons` resolves `item.icon` through the shared `Icon` registry. */
export const Icons: Story = {
  args: {
    variant: 'icons',
    theme: 'light',
    headline: 'Why act early',
    items: STAT_ITEMS,
  },
};

/** `cards` is the only variant that renders `item.description`. */
export const Cards: Story = {
  args: {
    variant: 'cards',
    theme: 'light',
    headline: 'Why act early',
    items: STAT_ITEMS.map((item) => ({
      ...item,
      description: 'Source: Alzheimer’s Association, 2024',
    })),
  },
};

export const DarkTheme: Story = {
  args: {
    ...Counters.args,
    theme: 'dark',
  },
};

export const PrimaryTheme: Story = {
  args: {
    ...Counters.args,
    theme: 'primary',
  },
};

export const GradientTheme: Story = {
  args: {
    ...Counters.args,
    theme: 'gradient',
  },
};

/** Header is optional. */
export const WithoutHeader: Story = {
  args: {
    variant: 'counters',
    items: STAT_ITEMS,
  },
};

/** The grid is fixed at 4 columns on desktop, so fewer items leave a short row. */
export const TwoStats: Story = {
  args: {
    variant: 'counters',
    headline: 'Why act early',
    items: STAT_ITEMS.slice(0, 2),
  },
};
