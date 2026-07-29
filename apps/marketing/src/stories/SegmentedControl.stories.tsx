import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { SegmentedControl } from "@pbh/ui";

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pill toggle built as a CSS-only radio group — the selected segment is driven by ' +
          '`peer-checked`, so it ships no client JS of its own and submits as a normal form ' +
          'field. Works uncontrolled (`defaultValue`) or controlled (`value` + `onChange`). ' +
          'Columns size to the number of options.',
      },
    },
  },
  tags: ['autodocs'],
  args: { onChange: fn() },
  decorators: [
    (Story) => (
      <div className="w-96 bg-surface p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The intake flow&rsquo;s "who is this for" toggle. */
export const TwoOptions: Story = {
  args: {
    name: 'assessment-for',
    'aria-label': 'Who is this assessment for?',
    defaultValue: 'myself',
    options: [
      { label: 'Myself', value: 'myself' },
      { label: 'Someone Else', value: 'someone-else' },
    ],
  },
};

export const ThreeOptions: Story = {
  args: {
    name: 'contact-preference',
    'aria-label': 'Preferred contact method',
    defaultValue: 'email',
    options: [
      { label: 'Email', value: 'email' },
      { label: 'Phone', value: 'phone' },
      { label: 'Text', value: 'text' },
    ],
  },
};

export const FourOptions: Story = {
  args: {
    name: 'age-range',
    'aria-label': 'Age range',
    defaultValue: '55-64',
    options: [
      { label: '45–54', value: '45-54' },
      { label: '55–64', value: '55-64' },
      { label: '65–74', value: '65-74' },
      { label: '75+', value: '75-plus' },
    ],
  },
};

/** Nothing pre-selected — every segment renders in its resting style. */
export const NoDefaultSelection: Story = {
  args: {
    name: 'assessment-for-empty',
    'aria-label': 'Who is this assessment for?',
    options: [
      { label: 'Myself', value: 'myself' },
      { label: 'Someone Else', value: 'someone-else' },
    ],
  },
};

/** Controlled: `value` fixes the selection and `onChange` reports the intent. */
export const Controlled: Story = {
  args: {
    name: 'assessment-for-controlled',
    'aria-label': 'Who is this assessment for?',
    value: 'someone-else',
    options: [
      { label: 'Myself', value: 'myself' },
      { label: 'Someone Else', value: 'someone-else' },
    ],
  },
};

/** Labels longer than the segment wrap rather than overflow the pill. */
export const LongLabels: Story = {
  args: {
    name: 'plan',
    'aria-label': 'Plan type',
    defaultValue: 'comprehensive',
    options: [
      { label: 'Baseline Assessment', value: 'baseline' },
      { label: 'Comprehensive Program', value: 'comprehensive' },
    ],
  },
};
