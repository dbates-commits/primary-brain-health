import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { UserMenu } from "@/components/layout/UserMenu";

const meta = {
  title: 'Layout/UserMenu',
  component: UserMenu,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The signed-in account menu (Figma 1917:7795 for the trigger, 1917:7808 for the ' +
          'dropdown). Replaces the Login item in the header once a session resolves. ' +
          'Dashboard and Profile are `#` placeholders — neither screen exists yet — and ' +
          'Logout submits the same server action as the welcome screen, which revokes the ' +
          'database session rather than just dropping the cookie. ' +
          'That action is swapped for a stand-in by `.storybook/main.ts`.',
      },
    },
  },
  tags: ['autodocs'],
  args: { firstName: 'David' },
  decorators: [
    (Story) => (
      <div className="min-h-[260px] bg-surface p-10">
        <div className="flex justify-end">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The trigger as it sits in the nav: initial avatar, first name, caret. */
export const Closed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /David/ });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveTextContent('D');
  },
};

/** Opened, with focus landed on the first item. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /David/ }));
    const menu = canvas.getByRole('menu', { name: 'Account' });
    await expect(menu).toBeVisible();
    await expect(canvas.getAllByRole('menuitem')).toHaveLength(3);
    await expect(canvas.getByRole('menuitem', { name: 'Dashboard' })).toHaveFocus();
  },
};

/** Escape closes the menu and hands focus back to the trigger. */
export const EscapeCloses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /David/ });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

/** A name that isn't "David" — the avatar takes whatever initial it's given. */
export const OtherName: Story = {
  args: { firstName: 'aisha' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: /aisha/ }),
    ).toHaveTextContent('A');
  },
};
