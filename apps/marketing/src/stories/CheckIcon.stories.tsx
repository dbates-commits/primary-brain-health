import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CheckIcon } from "@pbh/ui";

const meta = {
  title: 'Components/CheckIcon',
  component: CheckIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The bare checkmark glyph, drawn in `currentColor` so a text utility sets its ' +
          'colour. Deliberately distinct from `<Icon name="check" />`, which is a check ' +
          '*inside a circle* — this one is just the tick, for cases where something else ' +
          'draws the surrounding shape (see `Checkbox`). The viewBox is 16×16, so sizing it ' +
          'larger wants padding rather than scaling: `size-6 p-1` renders a 16px tick in a ' +
          '24px box, which is exactly what `Checkbox` does.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-background-default p-8 text-brand-default">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CheckIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { className: 'size-6' },
};

/** Colour follows the parent&rsquo;s text colour. */
export const InheritsColor: Story = {
  render: () => (
    <div className="flex gap-8">
      <CheckIcon className="size-6 text-brand-default" />
      <CheckIcon className="size-6 text-aqua-default" />
      <CheckIcon className="size-6 text-error" />
      <CheckIcon className="size-6 text-text-default" />
    </div>
  ),
};

/**
 * Padding, not scaling: each box is bigger than the last while the tick keeps
 * its 16px drawing.
 */
export const PaddedRatherThanScaled: Story = {
  render: () => (
    <div className="flex items-end gap-8">
      {(
        [
          { box: 'size-4', pad: '', label: 'size-4' },
          { box: 'size-6', pad: 'p-1', label: 'size-6 p-1' },
          { box: 'size-8', pad: 'p-2', label: 'size-8 p-2' },
        ] as const
      ).map((s) => (
        <div key={s.label} className="flex flex-col items-center gap-2">
          <span className="rounded bg-brand-default text-brand-on-brand">
            <CheckIcon className={`${s.box} ${s.pad}`} />
          </span>
          <span className="text-xs text-text-default">{s.label}</span>
        </div>
      ))}
    </div>
  ),
};
