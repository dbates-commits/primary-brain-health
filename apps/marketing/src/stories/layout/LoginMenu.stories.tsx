import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { LoginMenu } from "@/components/layout/LoginMenu";

const meta = {
  title: 'Layout/LoginMenu',
  component: LoginMenu,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The `Login ⌄` header item and the panel it opens (Figma 1988:10483 for the trigger, ' +
          '1988:9756 for the open state). Not a `Modal`: no backdrop, no scroll lock, no portal — ' +
          'it is a popover you dismiss by looking away. Escape and click-outside close it, ' +
          'focus moves into the field on open and returns to the trigger on close. ' +
          'Desktop only; the mobile drawer renders `LoginPanel` inline instead. ' +
          'The server action it imports is swapped for a stand-in by `.storybook/main.ts`.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      // Stands in for the header row: the trigger sits at the right-hand end,
      // with room below for the panel to open into.
      <div className="min-h-[420px] bg-surface p-10">
        <div className="flex justify-end">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof LoginMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 1988:10483 — how the item sits in the nav when nothing is open. */
export const Closed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Login' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
};

/**
 * Opened from the trigger, with focus landed in the email field. The panel
 * fades and scales in over 200ms, so visibility is awaited rather than asserted
 * on the frame the click lands — it mounts at `opacity-0`.
 */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Login' }));
    await waitFor(async () => {
      await expect(canvas.getByRole('dialog', { name: 'Login' })).toBeVisible();
    });
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toHaveFocus();
  },
};

/** "Done" on the confirmation screen (Figma 1988:10534) dismisses the popover. */
export const DoneDismisses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Login' });
    await userEvent.click(trigger);
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Email' }),
      'jane.doe@email.com',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Send Confirmation Email' }),
    );
    await waitFor(
      async () => {
        await expect(
          canvas.getByRole('button', { name: 'Done' }),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
    // The panel stays mounted for the length of the exit transition.
    await waitFor(async () => {
      await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveFocus();
  },
};

/** Escape closes the panel and hands focus back to the trigger. */
export const EscapeCloses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Login' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await expect(trigger).toHaveFocus();
  },
};
