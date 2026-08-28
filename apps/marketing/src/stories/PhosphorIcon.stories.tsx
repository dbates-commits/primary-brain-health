import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PhosphorIcon } from "@pbh/ui";

const WEIGHTS = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'] as const;

const meta = {
  title: 'Components/PhosphorIcon',
  component: PhosphorIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Dynamic lookup into `@phosphor-icons/react` by name — used where the icon is ' +
          'chosen in Tina rather than at build time. `name` is the Phosphor export name ' +
          '(PascalCase, e.g. `Brain`). Missing or unknown names render nothing.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    weight: { control: 'inline-radio', options: [...WEIGHTS] },
    size: { control: 'number' },
  },
} satisfies Meta<typeof PhosphorIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Brain',
    size: 48,
    weight: 'regular',
    className: 'text-brand-default',
  },
};

/** All six Phosphor weights on the same glyph. */
export const AllWeights: Story = {
  render: () => (
    <div className="flex gap-8 bg-background-default p-8 text-brand-default">
      {WEIGHTS.map((weight) => (
        <div key={weight} className="flex flex-col items-center gap-2">
          <PhosphorIcon name="Brain" size={40} weight={weight} />
          <span className="text-xs text-text-default">{weight}</span>
        </div>
      ))}
    </div>
  ),
};

/** Glyphs used across the marketing blocks. */
export const CommonIcons: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-6 bg-background-default p-8 text-aqua-default">
      {['Brain', 'HeartStraight', 'Stethoscope', 'ChartLineUp', 'ShieldCheck', 'Clock', 'Users', 'CheckCircle'].map(
        (name) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <PhosphorIcon name={name} size={32} weight="duotone" />
            <span className="text-xs text-text-default">{name}</span>
          </div>
        ),
      )}
    </div>
  ),
};

/** `size` accepts a number (px) or any CSS length string. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-8 bg-background-default p-8 text-brand-default">
      {[16, 24, 32, 48, 64].map((size) => (
        <PhosphorIcon key={size} name="Brain" size={size} weight="bold" />
      ))}
    </div>
  ),
};

/** No `name`, or a name Phosphor doesn&rsquo;t export, renders `null`. */
export const UnknownName: Story = {
  args: {
    name: 'NotARealPhosphorIcon',
    size: 48,
  },
};
