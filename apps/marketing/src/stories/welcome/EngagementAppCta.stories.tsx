import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { EngagementAppCta } from "@/components/welcome/EngagementAppCta";

const meta = {
  title: 'Welcome/EngagementAppCta',
  component: EngagementAppCta,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The last screen we own, rendered by the `/welcome` route once a payment ' +
          'has succeeded. Its button links out to the Linus Engagement App, which owns ' +
          'login and the assessments themselves. That link comes from ' +
          '`NEXT_PUBLIC_ENGAGEMENT_APP_URL`, inlined at build time: with it unset (as in ' +
          'Storybook) the confirmation renders without a button and promises the link by ' +
          'email instead, rather than showing a dead one to someone who has just paid.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EngagementAppCta>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The confirmation a customer sees straight after paying. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The heading renders a typographic apostrophe (`&rsquo;` → U+2019), so
    // match either form rather than the ASCII one alone.
    await expect(canvas.getByText(/You[’']re all set/)).toBeInTheDocument();
  },
};
