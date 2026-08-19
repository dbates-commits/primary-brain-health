import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Icon } from "@pbh/ui";

/** Every name in the `Icon` registry. Keep in sync with `packages/ui/src/Icon.tsx`. */
const ICON_NAMES = [
  'rocket',
  'shield',
  'zap',
  'heart',
  'star',
  'check',
  'clock',
  'globe',
  'lock',
  'chart',
  'users',
  'code',
  'chevronDown',
  'quote',
  'arrowRight',
  'play',
  'menu',
  'close',
] as const;

const meta = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Inline SVG icon set. Icons inherit `currentColor`, so colour is set by the parent ' +
          'text colour rather than a prop. An unrecognised `name` renders nothing.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'select', options: [...ICON_NAMES] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'check',
    size: 'md',
    className: 'text-brand-default',
  },
};

/** The full registry — the reference sheet when picking a `name`. */
export const AllIcons: Story = {
  args: { name: 'check' },
  render: () => (
    <div className="grid grid-cols-6 gap-6 bg-background-default p-8 text-brand-default">
      {ICON_NAMES.map((name) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon name={name} size="lg" />
          <span className="text-xs text-text-default">{name}</span>
        </div>
      ))}
    </div>
  ),
};

/** sm 16px · md 24px · lg 32px · xl 48px. */
export const AllSizes: Story = {
  args: { name: 'rocket' },
  render: () => (
    <div className="flex items-end gap-8 bg-background-default p-8 text-brand-default">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon name="rocket" size={size} />
          <span className="text-xs text-text-default">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** Colour comes from the parent&rsquo;s text colour via `currentColor`. */
export const InheritsColor: Story = {
  args: { name: 'heart' },
  render: () => (
    <div className="flex gap-8 bg-background-default p-8">
      <Icon name="heart" size="lg" className="text-brand-default" />
      <Icon name="heart" size="lg" className="text-aqua-default" />
      <Icon name="heart" size="lg" className="text-error" />
      <Icon name="heart" size="lg" className="text-text-default" />
    </div>
  ),
};

/** Unknown names render `null` rather than throwing — safe for CMS-driven values. */
export const UnknownName: Story = {
  args: {
    name: 'not-a-real-icon',
    size: 'lg',
  },
};
