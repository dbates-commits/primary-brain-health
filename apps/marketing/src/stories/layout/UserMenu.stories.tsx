import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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
          'Profile links to `/profile`; Dashboard is still a `#` placeholder, because ' +
          'that screen has not been built. Logout submits the same server action as the ' +
          'welcome screen, which revokes the ' +
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

/**
 * Opened, with focus landed on the first item. The menu fades and scales in
 * over 200ms, so visibility is awaited rather than asserted on the frame the
 * click lands — it mounts at `opacity-0`.
 */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /David/ }));
    await waitFor(async () => {
      await expect(canvas.getByRole('menu', { name: 'Account' })).toBeVisible();
    });
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
    // The menu stays mounted for the length of the exit transition.
    await waitFor(async () => {
      await expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    });
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
