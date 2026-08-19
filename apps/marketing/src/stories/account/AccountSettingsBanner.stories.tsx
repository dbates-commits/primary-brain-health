import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { AccountSettingsBanner } from "@/components/account/AccountSettingsBanner";

const meta = {
  title: 'Account/AccountSettingsBanner',
  component: AccountSettingsBanner,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The masthead on the account page (Figma 2092:13093). 48px Larken over a 20px ' +
          'body line, white on `primary`, at the 12px card radius. The copy is fixed — it ' +
          'is the page title, not a slot — so the component takes no props. The 40px frame ' +
          'around it in the design is the page gutter, applied by `/profile`, which is why ' +
          'this story supplies its own. Below `md` the 80px of vertical teal halves: at ' +
          'phone width the full padding is most of the viewport.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      // The ground it is drawn against, at the page's own gutters.
      <div className="bg-background-brand-subtle p-6 lg:p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountSettingsBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page title and its one supporting line — the only state there is. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // `h1`, not `h2`: Figma's "Heading / H2" names the type ramp entry, and this
    // is the only top-level heading on the page.
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Account Settings' }),
    ).toBeVisible();
    await expect(
      canvas.getByText('Manage your profile information and subscription.'),
    ).toBeVisible();
  },
};
