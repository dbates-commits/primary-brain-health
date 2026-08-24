import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Header } from "@/components/layout/Header";

/**
 * A resolved session, handed to `SessionProvider` so it never calls
 * `/api/auth/session` — there is no Auth.js route behind Storybook. Only `id`
 * and `firstName` reach the browser in the app (`src/types/next-auth.d.ts`),
 * and `firstName` is the only thing the header branches on.
 */
const SIGNED_IN: Session = {
  user: { id: 'usr_story', firstName: 'David' },
  expires: '2099-01-01T00:00:00.000Z',
};

const meta = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    // `usePathname` — the App Router hooks throw without this.
    nextjs: { appDirectory: true },
    // Named here so the mobile stories below can opt in; the rest run at the
    // default desktop size.
    viewport: {
      options: {
        phone: { name: 'Phone', styles: { width: '402px', height: '874px' } },
      },
    },
    docs: {
      description: {
        component:
          'The site header, in both session states. Signed out it carries FAQs, Contact, the ' +
          '`Login ⌄` popover and the Book a Consultation CTA. Signed in it matches Figma ' +
          '2092:13082 — logo, Contact, account menu — because a customer who has already ' +
          'booked has no use for the FAQs link or the acquisition CTA. ' +
          'The `"use server"` modules it reaches for are swapped for stand-ins by ' +
          '`.storybook/main.ts`.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      // The header is `fixed`, so the frame needs height of its own for it to
      // sit against, and a ground to read on.
      <div className="min-h-[420px] bg-surface">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No session: the full nav, the Login trigger, and the CTA. */
export const SignedOut: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={null} refetchOnWindowFocus={false}>
        <Story />
      </SessionProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // `getAllBy*` rather than a count: the desktop row and the collapsed
    // mobile drawer each render their own copy, and which of the two the
    // a11y tree reports depends on the viewport the story runs at.
    await expect(canvas.getAllByRole('link', { name: 'FAQs' }).length)
      .toBeGreaterThan(0);
    await expect(canvas.getAllByRole('link', { name: 'Contact' }).length)
      .toBeGreaterThan(0);
    await expect(canvas.getAllByRole('button', { name: 'Login' }).length)
      .toBeGreaterThan(0);
    await expect(
      canvas.getAllByRole('link', { name: 'Book a Consultation' }).length,
    ).toBeGreaterThan(0);
  },
};

/**
 * The mobile drawer→login→drawer handshake (Figma 2155:12505 → 2155:12230), at
 * a real phone size. This is the only place the two surfaces are exercised
 * together: the drawer stays open *underneath* the modal, which is what makes
 * the back arrow an uncover rather than a re-open.
 *
 * Queried through `document.body`, because the modal is portalled out of the
 * story root.
 */
export const MobileLoginFlow: Story = {
  globals: { viewport: { value: 'phone' } },
  decorators: [
    (Story) => (
      <SessionProvider session={null} refetchOnWindowFocus={false}>
        <Story />
      </SessionProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    const menuButton = canvas.getByRole('button', { name: 'Toggle menu' });
    await userEvent.click(menuButton);
    // With the drawer open the hamburger *is* an X. Where it sits now is where
    // the modal's X has to sit, or the icon jumps as one replaces the other.
    const drawerX = menuButton.getBoundingClientRect();

    await userEvent.click(canvas.getByRole('button', { name: 'Login' }));

    // It fades in over 200ms, so visibility is awaited rather than asserted on
    // the frame the click lands — it mounts at `opacity-0`.
    await waitFor(async () => {
      await expect(body.getByRole('dialog', { name: 'Login' })).toBeVisible();
    });

    // Measured, not eyeballed: the modal's row is built from the header row's
    // own classes, and this assertion is what holds that true. Rounded to the
    // pixel — a sub-pixel difference is not a visible jump.
    const modalX = body
      .getByRole('button', { name: 'Close' })
      .getBoundingClientRect();
    await expect(Math.round(modalX.left)).toBe(Math.round(drawerX.left));
    await expect(Math.round(modalX.top)).toBe(Math.round(drawerX.top));
    await expect(Math.round(modalX.width)).toBe(Math.round(drawerX.width));
    await expect(Math.round(modalX.height)).toBe(Math.round(drawerX.height));

    // Back: the layer goes, the drawer is still open behind it, and the row
    // that opened it has focus again.
    await userEvent.click(body.getByRole('button', { name: 'Back to menu' }));
    await waitFor(async () => {
      await expect(body.queryByRole('dialog', { name: 'Login' })).toBeNull();
    });
    await expect(canvas.getByRole('button', { name: 'Login' })).toHaveFocus();

    // X: the whole stack goes, and focus lands on the hamburger — not on the
    // Login row, which is inert inside a closed drawer by then.
    await userEvent.click(canvas.getByRole('button', { name: 'Login' }));
    await waitFor(async () => {
      await expect(body.getByRole('dialog', { name: 'Login' })).toBeVisible();
    });
    await userEvent.click(body.getByRole('button', { name: 'Close' }));
    await waitFor(async () => {
      await expect(body.queryByRole('dialog', { name: 'Login' })).toBeNull();
    });
    await expect(menuButton).toHaveFocus();
  },
};

/**
 * Figma 2092:13082. FAQs and the CTA are gone from the desktop row *and* the
 * drawer, so both are asserted at zero rather than merely not-visible — the
 * drawer stays mounted while closed.
 */
export const SignedIn: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={SIGNED_IN} refetchOnWindowFocus={false}>
        <Story />
      </SessionProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('link', { name: 'Contact' }).length)
      .toBeGreaterThan(0);
    await expect(canvas.getByRole('button', { name: /David/ })).toBeVisible();
    await expect(canvas.queryAllByRole('link', { name: 'FAQs' })).toHaveLength(0);
    await expect(
      canvas.queryAllByRole('link', { name: 'Book a Consultation' }),
    ).toHaveLength(0);
    await expect(canvas.queryAllByRole('button', { name: 'Login' })).toHaveLength(0);
  },
};
