import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { FieldError, Label, Select } from "@pbh/ui";

const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Styled native `<select>`. The native arrow is suppressed with `appearance-none` and ' +
          'replaced by an overlaid chevron, since browsers will not style the built-in one. ' +
          'The wrapper carries `mt-2` to sit directly under a `Label`.',
      },
    },
  },
  tags: ['autodocs'],
  args: { onChange: fn() },
  decorators: [
    (Story) => (
      <div className="w-80 bg-background-default p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const stateOptions = (
  <>
    <option value="">Select a state</option>
    <option value="MA">Massachusetts</option>
    <option value="NY">New York</option>
    <option value="CA">California</option>
    <option value="TX">Texas</option>
  </>
);

export const Default: Story = {
  args: {
    'aria-label': 'State',
    children: stateOptions,
  },
};

/** The intended pairing — `Label` above, the wrapper&rsquo;s `mt-2` supplies the gap. */
export const WithLabel: Story = {
  args: {
    id: 'state',
    children: stateOptions,
  },
  render: (args) => (
    <div>
      <Label htmlFor="state">State</Label>
      <Select {...args} />
    </div>
  ),
};

/** Placeholder-style first option, unselected. */
export const Placeholder: Story = {
  args: {
    'aria-label': 'State',
    defaultValue: '',
    children: stateOptions,
  },
};

export const WithSelectedValue: Story = {
  args: {
    'aria-label': 'State',
    defaultValue: 'MA',
    children: stateOptions,
  },
};

export const Disabled: Story = {
  args: {
    'aria-label': 'State',
    disabled: true,
    defaultValue: 'MA',
    children: stateOptions,
  },
};

/** Error state, wired the same way as any other field. */
export const WithError: Story = {
  args: {
    id: 'state-error-field',
    'aria-invalid': true,
    'aria-describedby': 'state-error',
    defaultValue: '',
    children: stateOptions,
  },
  render: (args) => (
    <div>
      <Label htmlFor="state-error-field">State</Label>
      <Select {...args} />
      <FieldError id="state-error" message="Select the state where you receive care." />
    </div>
  ),
};

/** Long option lists stay a native dropdown — no custom scroll container to manage. */
export const ManyOptions: Story = {
  args: {
    'aria-label': 'Year of birth',
    children: (
      <>
        <option value="">Select a year</option>
        {Array.from({ length: 60 }, (_, index) => 1990 - index).map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </>
    ),
  },
};
