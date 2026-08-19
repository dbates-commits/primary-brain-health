import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { LoginPanel } from "@/components/layout/LoginPanel";
import { requestLoginLinkInline } from "./login-actions.mock";

const meta = {
  title: 'Layout/LoginPanel',
  component: LoginPanel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The body of the header login popover (Figma 1988:9756, 1988:11481, 1988:10890). ' +
          'Also rendered inline in the mobile drawer, which is why it carries its own card ' +
          'chrome and takes its width from the parent. ' +
          'The action is injected: the real one is `"use server"` and pulls in Auth.js and ' +
          'the database, so these stories pass the stand-in from `login-actions.mock.ts`. ' +
          'In that mock, any address containing "unknown" is treated as having no account.',
      },
    },
  },
  tags: ['autodocs'],
  args: { action: requestLoginLinkInline, className: 'w-[470px]' },
} satisfies Meta<typeof LoginPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Figma 1988:9756 — nothing typed yet, so the CTA is muted and disabled. No
 * visible field label at this point; the accessible name comes from
 * `aria-label`.
 */
export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Send Confirmation Email' }),
    ).toBeDisabled();
  },
};

/** Figma 1988:11481 — an address is typed, so the CTA comes up to full strength. */
export const Filled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Email' }),
      'jane.doe@email.com',
    );
    await expect(
      canvas.getByRole('button', { name: 'Send Confirmation Email' }),
    ).toBeEnabled();
  },
};

/**
 * Figma 1988:10890 — the address has no account. This state is the one that
 * discloses who is registered; see the note in `docs/auth.md`. The visible
 * `Email` label only appears here, which is how the states are drawn.
 */
export const Unregistered: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Email' }),
      'unknown@email.com',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Send Confirmation Email' }),
    );
    await waitFor(
      async () => {
        await expect(canvas.getByRole('alert')).toHaveTextContent(
          'Not an active user.',
        );
      },
      { timeout: 5000 },
    );
    await expect(canvas.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  },
};

/** A malformed address never reaches Auth.js — it comes back from validation. */
export const InvalidAddress: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox', { name: 'Email' }), 'jane');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Send Confirmation Email' }),
    );
    await waitFor(
      async () => {
        await expect(canvas.getByRole('alert')).toHaveTextContent(
          'Enter a valid email address.',
        );
      },
      { timeout: 5000 },
    );
  },
};

/**
 * Figma 1988:10534 — success, reported in place rather than by navigating,
 * which is the point of signing in from the nav. The whole card changes: the
 * heading becomes "Email Confirmation" and the only control left is "Done",
 * which dismisses the panel and takes focus on arrival.
 */
export const Sent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
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
          canvas.getByRole('heading', { name: 'Email Confirmation' }),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    await expect(
      canvas.getByText(/check your inbox in order to login/i),
    ).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Done' })).toHaveFocus();
  },
};
