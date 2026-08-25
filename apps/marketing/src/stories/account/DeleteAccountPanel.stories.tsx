import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { findBannedTerms } from "@pbh/copy";
import { AccountCard } from "@/components/account/AccountCard";
import { DeleteAccountPanel } from "@/components/account/DeleteAccountPanel";
import {
  ACTION_DELAY_MS,
  SLOW_ACTION_DELAY_MS,
  deleteAccountFails,
  deleteAccountSpy,
  deleteAccountSucceeds,
} from './mock-actions';

/** The modal portals out of the story root, so queries go through the body. */
const screen = () => within(document.body);

const EMAIL = 'david.smith@email.com';

/** Filled by `deleteAccountSpy` in the story that checks the payload. */
let submittedKeys: string[] = [];

const meta = {
  title: 'Account/DeleteAccountPanel',
  component: DeleteAccountPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The Delete Account card and its confirmation modal (Figma 1988:12282 and ' +
          '2060:7053). Props-only: the server action is injected, and the real sign-out ' +
          'lives one file up in `DeleteAccountPanelWithSignOut`, so nothing here imports a ' +
          '`"use server"` module and no `.storybook/main.ts` alias is needed. ' +
          'Two deliberate deviations from the design. Figma draws the confirmation ' +
          'checkbox already ticked — it ships unticked, since a pre-satisfied gate is not a ' +
          'gate — and its card copy reads "permanentely", fixed here. Note the copy claims ' +
          'more than the code does: pressing the button stamps `users.deactivated_at` and ' +
          'locks the account out, while the erasure it promises is an operator routine.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-background-brand-subtle p-6">
        <AccountCard>
          <Story />
        </AccountCard>
      </div>
    ),
  ],
} satisfies Meta<typeof DeleteAccountPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Click the card's button and wait for the dialog to finish arriving.
 *
 * `getByRole('dialog')` finds it on the mount frame, when it is still
 * `opacity-0` under a `pointer-events-none` backdrop — so waiting for presence
 * alone races the 200ms fade and both an assertion and a click fail against it.
 * Waiting for visibility is what makes these deterministic.
 */
async function openDialog() {
  await userEvent.click(
    within(document.body).getByRole('button', { name: 'Delete Account' }),
  );
  const dialog = screen().getByRole('dialog', { name: 'Delete Account' });
  await waitFor(() => {
    expect(dialog).toBeVisible();
  });
  return dialog;
}

/** Opens the modal and ticks the box, so the confirm button is live. */
async function arm() {
  const dialog = await openDialog();
  await userEvent.click(within(dialog).getByRole('checkbox'));
  return dialog;
}

/** The resting card: heading, sub-copy, rule, and the destructive button. */
export const Default: Story = {
  args: { email: EMAIL, action: deleteAccountSucceeds(), onDeactivated: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Delete Account' }),
    ).toBeVisible();
    await expect(
      canvas.getByText('Your account will be permanently deleted.'),
    ).toBeVisible();
    // Figma's typo, pinned so it can't come back with a re-import.
    await expect(canvas.queryByText(/permanentely/i)).toBeNull();
    const trigger = canvas.getByRole('button', { name: 'Delete Account' });
    await expect(trigger).toBeEnabled();
    // Measured, not read off the class list: a `bg-danger` in the source is only
    // a real colour if `--color-danger` was also mirrored into `@theme inline`,
    // and a missing mirror fails silently by emitting no utility at all.
    await expect(getComputedStyle(trigger).backgroundColor).toBe('rgb(214, 0, 18)');
    // Nothing is open until asked.
    await expect(screen().queryByRole('dialog')).toBeNull();
  },
};

/** Clicking through opens the dialog with the confirm button still disabled. */
export const OpensModal: Story = {
  args: { email: EMAIL, action: deleteAccountSucceeds(), onDeactivated: fn() },
  play: async () => {
    const dialog = await openDialog();
    await expect(within(dialog).getByText(EMAIL)).toBeVisible();
    await expect(
      within(dialog).getByRole('button', { name: 'Request for Deletion' }),
    ).toBeDisabled();
    // Figma draws no X, and a third way out next to an irreversible action
    // would be one too many.
    await expect(within(dialog).queryByRole('button', { name: 'Close' })).toBeNull();
  },
};

/** The checkbox starts unticked, and gates the confirm button both ways. */
export const ConfirmGateStartsUnchecked: Story = {
  args: { email: EMAIL, action: deleteAccountSucceeds(), onDeactivated: fn() },
  play: async () => {
    const dialog = await openDialog();

    const box = within(dialog).getByRole('checkbox');
    const confirm = within(dialog).getByRole('button', {
      name: 'Request for Deletion',
    });

    await expect(box).not.toBeChecked();
    await expect(confirm).toBeDisabled();

    await userEvent.click(box);
    await expect(confirm).toBeEnabled();

    await userEvent.click(box);
    await expect(confirm).toBeDisabled();
  },
};

/** Cancel dismisses and hands focus back to the button that opened it. */
export const CancelRestoresFocus: Story = {
  args: { email: EMAIL, action: deleteAccountSucceeds(), onDeactivated: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Delete Account' });
    const dialog = await openDialog();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen().queryByRole('dialog')).toBeNull();
    });
    await expect(trigger).toHaveFocus();
  },
};

/** Escape cancels too, and the gate resets when it is opened again. */
export const EscapeCancelsAndResetsTheGate: Story = {
  args: { email: EMAIL, action: deleteAccountSucceeds(), onDeactivated: fn() },
  play: async () => {
    const dialog = await arm();
    await expect(within(dialog).getByRole('checkbox')).toBeChecked();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen().queryByRole('dialog')).toBeNull();
    });

    const reopened = await openDialog();
    await expect(within(reopened).getByRole('checkbox')).not.toBeChecked();
  },
};

/**
 * The happy path. The dialog deliberately stays up after success — the caller
 * is navigating away, and closing it would flash the card underneath.
 */
export const FilesTheRequest: Story = {
  args: { email: EMAIL, action: deleteAccountSucceeds(), onDeactivated: fn() },
  play: async ({ args }) => {
    const dialog = await arm();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Request for Deletion' }),
    );

    await expect(
      await within(dialog).findByRole('button', { name: 'Deleting…' }),
    ).toBeDisabled();
    await expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();

    await waitFor(() => {
      expect(args.onDeactivated).toHaveBeenCalledTimes(1);
    });
    await expect(dialog).toBeVisible();
  },
};

/** A failed request keeps the dialog open, the box ticked and the button live. */
export const ActionFails: Story = {
  args: {
    email: EMAIL,
    action: deleteAccountFails(
      'Something went wrong deleting your account. Please try again.',
    ),
    onDeactivated: fn(),
  },
  play: async ({ args }) => {
    const dialog = await arm();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Request for Deletion' }),
    );

    const alert = await within(dialog).findByRole('alert', undefined, {
      timeout: ACTION_DELAY_MS + 2000,
    });
    await expect(alert).toHaveTextContent(
      'Something went wrong deleting your account. Please try again.',
    );
    await expect(dialog).toBeVisible();
    await expect(within(dialog).getByRole('checkbox')).toBeChecked();
    await expect(
      within(dialog).getByRole('button', { name: 'Request for Deletion' }),
    ).toBeEnabled();
    await expect(args.onDeactivated).not.toHaveBeenCalled();
  },
};

/**
 * The backdrop is inert while the request is in flight — the dialog must not be
 * dismissable out from under an action that is already committing.
 */
export const BackdropIsInertWhilePending: Story = {
  args: {
    email: EMAIL,
    action: deleteAccountSucceeds(SLOW_ACTION_DELAY_MS),
    onDeactivated: fn(),
  },
  play: async () => {
    const dialog = await arm();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Request for Deletion' }),
    );
    await within(dialog).findByRole('button', { name: 'Deleting…' });

    // The backdrop is the dialog's parent; mousedown on it is what dismisses.
    await userEvent.click(dialog.parentElement as HTMLElement);
    await expect(dialog).toBeVisible();
  },
};

/**
 * Focus cannot escape while the request is in flight. The disabled fieldset
 * blurs whatever had focus to `<body>` and leaves nothing focusable inside the
 * dialog at all, so `use-focus-trap` swallows the Tab rather than letting it
 * walk into the card behind an opaque overlay.
 */
export const TrapSurvivesPending: Story = {
  args: {
    email: EMAIL,
    action: deleteAccountSucceeds(SLOW_ACTION_DELAY_MS),
    onDeactivated: fn(),
  },
  play: async () => {
    const dialog = await arm();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Request for Deletion' }),
    );
    await within(dialog).findByRole('button', { name: 'Deleting…' });

    (document.activeElement as HTMLElement | null)?.blur();
    await expect(document.body).toHaveFocus();

    await userEvent.keyboard('{Tab}');
    await expect(document.body).toHaveFocus();
    await expect(
      within(document.body)
        .getByRole('button', { name: 'Delete Account' })
        .contains(document.activeElement),
    ).toBe(false);
  },
};

/**
 * The compliance sweep, over the card *and* the open dialog. Same guard as
 * `PlanSummary`, against `document.body` because the dialog is portalled — this
 * is the surface most likely to have Figma's copy pasted straight back into it.
 */
export const CopyIsCompliant: Story = {
  args: { email: EMAIL, action: deleteAccountSucceeds(), onDeactivated: fn() },
  play: async () => {
    await openDialog();

    await expect(
      findBannedTerms(
        document.body.textContent ?? '',
        'DeleteAccountPanel + modal rendered text',
      ),
    ).toEqual([]);
  },
};

/**
 * The submitted payload really carries the confirmation field. The server
 * re-checks it, so proving the button was enabled is not the same as proving it
 * arrived.
 */
export const SubmitsConfirmField: Story = {
  args: {
    email: EMAIL,
    action: deleteAccountSpy((keys) => {
      submittedKeys = keys;
    }),
    onDeactivated: fn(),
  },
  play: async () => {
    submittedKeys = [];
    const dialog = await arm();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Request for Deletion' }),
    );

    await waitFor(() => {
      expect(submittedKeys).toContain('confirm');
    });
  },
};
