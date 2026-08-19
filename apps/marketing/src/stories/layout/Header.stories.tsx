import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
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
      <div className="min-h-[420px] bg-background-default">
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
