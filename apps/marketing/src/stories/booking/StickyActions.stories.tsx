import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StickyActions } from "@pbh/booking";
import { Button } from "@pbh/ui";
import { BookingModalShell } from "./BookingModalShell";

const meta = {
  title: 'Booking/StickyActions',
  component: StickyActions,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Pins a step’s actions to the bottom of the modal’s scroll area so the submit stays ' +
          'reachable on the long steps. It needs a scrolling ancestor to pin against, so every ' +
          'story renders it inside the modal shell. The blur and the fade need no overflow ' +
          'detection — over blank surface they are imperceptible, and they only resolve into ' +
          'view once content actually scrolls behind them. Compare **Short Content** with ' +
          '**Scrolling Content** to see that.',
      },
    },
  },
  tags: ['autodocs'],
  // Every story supplies its own `render`; this satisfies the required prop.
  args: { children: null },
} satisfies Meta<typeof StickyActions>;

export default meta;
type Story = StoryObj<typeof meta>;

const PARAGRAPHS = Array.from({ length: 12 }, (_, i) => i);

/** Nothing to scroll — the bar sits inline and the treatment is invisible. */
export const ShortContent: Story = {
  render: () => (
    <BookingModalShell>
      <div className="flex flex-col gap-8">
        <p className="text-sm text-text-default">
          A step short enough to fit, so the bar never leaves the flow.
        </p>
        <StickyActions>
          <Button color="primary" className="w-full">
            Continue
          </Button>
        </StickyActions>
      </div>
    </BookingModalShell>
  ),
};

/** Content behind the bar — the blur and the fade above it resolve into view. */
export const ScrollingContent: Story = {
  render: () => (
    <BookingModalShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          {PARAGRAPHS.map((n) => (
            <p key={n} className="text-sm leading-relaxed text-text-default">
              Paragraph {n + 1}. Scroll the panel and watch the action bar hold
              its position while this copy passes behind it.
            </p>
          ))}
        </div>
        <StickyActions>
          <Button color="primary" className="w-full">
            Continue
          </Button>
        </StickyActions>
      </div>
    </BookingModalShell>
  ),
};

/**
 * The consent step&rsquo;s arrangement: a gate above the CTA, both pinned, via
 * `className` on the bar.
 */
export const WithGateAboveTheCta: Story = {
  render: () => (
    <BookingModalShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          {PARAGRAPHS.map((n) => (
            <p key={n} className="text-sm leading-relaxed text-text-default">
              Paragraph {n + 1}. The gate has to stay with the button — it is
              what enables it.
            </p>
          ))}
        </div>
        <StickyActions className="flex flex-col gap-8">
          <p className="text-base text-grey-850">
            A gate that must stay visible with the button.
          </p>
          <Button color="primary" className="w-full">
            Continue With Payment
          </Button>
        </StickyActions>
      </div>
    </BookingModalShell>
  ),
};
