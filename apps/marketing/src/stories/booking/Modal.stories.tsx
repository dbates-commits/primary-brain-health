import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { StepHeader } from "@pbh/ui";
import { Modal } from "@/components/booking/Modal";
import { ModalStoryHarness } from "./ModalStoryHarness";

const PARAGRAPHS = Array.from({ length: 14 }, (_, i) => i);

const meta = {
  title: 'Booking/Modal',
  component: Modal,
  parameters: {
    // The dialog portals to `document.body`, so it escapes the story canvas —
    // fullscreen is the only layout that reads correctly.
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The booking dialog. It renders into a portal on `document.body` and covers the ' +
          'a11y basics a raw overlay misses: Escape to close, backdrop click to close, body ' +
          'scroll lock, a focus trap cycling within the panel, initial focus into the panel, ' +
          'and focus restored to the trigger on close. It is portal-safe for SSR because it ' +
          'returns `null` until `open` flips true, which is always a client event. ' +
          '`Modal` is **controlled** — it reports intent through `onClose` and never closes ' +
          'itself — so every story here is wrapped in `ModalStoryHarness`, which owns the ' +
          '`open` state and renders the trigger button. Without a controller the dialog would ' +
          'stay put however you dismissed it. ' +
          'The `header` region is optional and pinned: give it one and only the body scrolls, ' +
          'so the scrollbar spans the content rather than the whole dialog. The body ' +
          'deliberately carries no bottom padding — that belongs to the step, because padding ' +
          'here would inset where a `sticky bottom-0` action bar pins.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    open: true,
    label: 'Book an assessment',
    onClose: fn(),
  },
  // `open` is dropped deliberately: the harness owns it, so a story that set it
  // would be overridden and read as ignored.
  render: (args) => {
    const { open, ...harnessProps } = args;
    void open;
    return <ModalStoryHarness {...harnessProps} />;
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No pinned header — the body owns the top padding and clears the close button. */
export const Open: Story = {
  args: {
    children: (
      <div className="flex flex-col gap-4 pb-6 sm:pb-10">
        <StepHeader title="Welcome." subtitle="A step that renders its own header." />
        <p className="text-sm text-text-default">
          Short enough that nothing scrolls. Dismiss it and reopen from the
          button behind.
        </p>
      </div>
    ),
  },
};

/** With a pinned header: the title stays put while only the body scrolls. */
export const WithPinnedHeader: Story = {
  args: {
    header: (
      <StepHeader
        title="Almost there!"
        subtitle="The header stays put; only the content below it moves."
      />
    ),
    children: (
      <div className="flex flex-col gap-4 pb-6 sm:pb-10">
        {PARAGRAPHS.map((n) => (
          <p key={n} className="text-sm leading-relaxed text-text-default">
            Paragraph {n + 1}. Scroll and watch the header hold its position.
          </p>
        ))}
      </div>
    ),
  },
};

/** `open: false` renders nothing at all — not a hidden node. */
export const Closed: Story = {
  args: {
    open: false,
    children: <p>Never rendered.</p>,
  },
  // The one story that wants the raw component: the harness always opens.
  render: (args) => <Modal {...args} />,
  play: async () => {
    await expect(document.querySelector('[role="dialog"]')).toBeNull();
  },
};

/** Escape dismisses it, and the dialog really leaves the DOM. */
export const ClosesOnEscape: Story = {
  args: {
    children: <p className="pb-6 text-sm text-text-default">Press Escape.</p>,
  },
  play: async ({ args }) => {
    // The dialog is portalled onto document.body, so it is outside canvasElement.
    const body = within(document.body);
    await expect(body.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(args.onClose).toHaveBeenCalled();
    });
    await waitFor(async () => {
      await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

/** The close button does the same. */
export const ClosesOnCloseButton: Story = {
  args: {
    children: <p className="pb-6 text-sm text-text-default">Use the ✕.</p>,
  },
  play: async ({ args }) => {
    const body = within(document.body);
    await userEvent.click(body.getByRole('button', { name: 'Close' }));
    await waitFor(async () => {
      await expect(args.onClose).toHaveBeenCalled();
    });
    await waitFor(async () => {
      await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

/** Clicking the backdrop dismisses it; clicking the panel does not. */
export const ClosesOnBackdropClick: Story = {
  args: {
    children: (
      <p className="pb-6 text-sm text-text-default">
        Click the dimmed area outside the panel.
      </p>
    ),
  },
  play: async ({ args }) => {
    const body = within(document.body);
    const panel = body.getByRole('dialog');
    // Dismissal is wired to mousedown, not click, so drive that directly —
    // it also sidesteps the panel covering the backdrop's centre point.
    // Inside the panel first: the dialog must survive this.
    fireEvent.mouseDown(panel);
    await expect(args.onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(panel.parentElement as HTMLElement);
    await waitFor(async () => {
      await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

/** Reopening after a dismissal — the trigger regains focus, then reopens. */
export const ReopensFromTrigger: Story = {
  args: {
    children: <p className="pb-6 text-sm text-text-default">Close, then reopen.</p>,
  },
  play: async ({ canvasElement }) => {
    const body = within(document.body);
    const canvas = within(canvasElement);
    await userEvent.click(body.getByRole('button', { name: 'Close' }));
    await waitFor(async () => {
      await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Open the dialog' }));
    await waitFor(async () => {
      await expect(body.getByRole('dialog')).toBeInTheDocument();
    });
  },
};
