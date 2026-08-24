import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { requestLoginLinkInline } from "@/app/login/actions";
import { MobileLoginModalHarness } from "./MobileLoginModalHarness";

/**
 * Queries go through `document.body`, not the canvas: the modal is portalled
 * out of the story root, so `within(canvasElement)` sees only the trigger.
 */
const screen = () => within(document.body);

const meta = {
  title: 'Layout/MobileLoginModal',
  component: MobileLoginModalHarness,
  parameters: {
    layout: 'fullscreen',
    // A real phone frame, because everything this component does is below `lg`.
    viewport: {
      options: {
        phone: { name: 'Phone', styles: { width: '402px', height: '874px' } },
      },
    },
    docs: {
      description: {
        component:
          'The mobile sign-in surface (Figma 2155:12230): a full-bleed layer over the drawer, ' +
          'holding the same `LoginPanel` the desktop popover uses. The back arrow steps down to ' +
          'the drawer, which has been open underneath the whole time; the X dismisses both. ' +
          'Portalled to `document.body` — the header carries `backdrop-blur`, which would ' +
          'otherwise become the containing block for a `fixed` overlay rendered inside it. ' +
          'The server action it imports is swapped for a stand-in by `.storybook/main.ts`.',
      },
    },
  },
  globals: { viewport: { value: 'phone' } },
  args: {
    action: requestLoginLinkInline,
    onBack: fn(),
    onClose: fn(),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MobileLoginModalHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * How the layer sits over the drawer, with focus landed in the email field. It
 * fades in over 200ms, so visibility is awaited rather than asserted on the
 * frame it mounts — it starts at `opacity-0`.
 */
export const Open: Story = {
  play: async () => {
    const body = screen();
    await waitFor(async () => {
      await expect(body.getByRole('dialog', { name: 'Login' })).toBeVisible();
    });
    await expect(body.getByRole('textbox', { name: 'Email' })).toHaveFocus();
    await expect(body.getByRole('button', { name: 'Back to menu' })).toBeVisible();
  },
};

/** The back arrow reports intent and hands the drawer back its Login row. */
export const BackReturns: Story = {
  play: async ({ args, canvasElement }) => {
    const body = screen();
    await waitFor(async () => {
      await expect(body.getByRole('dialog', { name: 'Login' })).toBeVisible();
    });
    await userEvent.click(body.getByRole('button', { name: 'Back to menu' }));
    await expect(args.onBack).toHaveBeenCalled();
    await waitFor(async () => {
      await expect(body.queryByRole('dialog', { name: 'Login' })).toBeNull();
    });
    await expect(
      within(canvasElement).getByRole('button', { name: 'Login' }),
    ).toBeVisible();
  },
};

/** The X dismisses the whole stack, not just this layer. */
export const CloseDismisses: Story = {
  play: async ({ args }) => {
    const body = screen();
    await waitFor(async () => {
      await expect(body.getByRole('dialog', { name: 'Login' })).toBeVisible();
    });
    await userEvent.click(body.getByRole('button', { name: 'Close' }));
    await expect(args.onClose).toHaveBeenCalled();
    await waitFor(async () => {
      await expect(body.queryByRole('dialog', { name: 'Login' })).toBeNull();
    });
  },
};

/**
 * Escape steps back rather than dismissing everything — the layer underneath is
 * a menu the user was in, so closing the top one reveals it again.
 */
export const EscapeGoesBack: Story = {
  play: async ({ args }) => {
    const body = screen();
    await waitFor(async () => {
      await expect(body.getByRole('dialog', { name: 'Login' })).toBeVisible();
    });
    await userEvent.keyboard('{Escape}');
    await expect(args.onBack).toHaveBeenCalled();
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};

/** Sent: the confirmation replaces the form in place and the layer stays up. */
export const Sent: Story = {
  play: async ({ args }) => {
    const body = screen();
    await waitFor(async () => {
      await expect(body.getByRole('dialog', { name: 'Login' })).toBeVisible();
    });
    await userEvent.type(
      body.getByRole('textbox', { name: 'Email' }),
      'someone@example.com',
    );
    await userEvent.click(
      body.getByRole('button', { name: 'Send Confirmation Email' }),
    );
    await waitFor(async () => {
      await expect(
        body.getByRole('heading', { name: 'Email Confirmation' }),
      ).toBeVisible();
    });
    await expect(body.getByRole('dialog', { name: 'Login' })).toBeVisible();

    await userEvent.click(body.getByRole('button', { name: 'Done' }));
    await expect(args.onClose).toHaveBeenCalled();
  },
};
