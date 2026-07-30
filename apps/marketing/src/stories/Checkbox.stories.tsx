import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Checkbox } from "@pbh/ui";

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A real `<input type="checkbox">` with the native tick hidden (`appearance-none`, ' +
          'which browsers won’t let us restyle) and `CheckIcon` drawn on top. Every native ' +
          'behaviour survives — focus, keyboard, form participation, `required` validation — ' +
          'so this is a paint job rather than a reimplementation. The tick is revealed by ' +
          '`peer-checked:` rather than by React state, which is why the icon has to stay a ' +
          'following sibling of the input. Used by `ConsentForm` as the agreement gate.',
      },
    },
  },
  tags: ['autodocs'],
  args: { onChange: fn() },
  decorators: [
    (Story) => (
      <div className="bg-surface p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

/** Uncontrolled — `defaultChecked` leaves the input owning its own state. */
export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true },
};

/**
 * `required` is enforced by the browser like any native checkbox — the consent
 * step pairs it with its own guard so the message can be worded.
 */
export const Required: Story = {
  args: { required: true, 'aria-required': true },
};

/**
 * How `ConsentForm` renders it: wrapped in a `<label>` so the text is part of
 * the hit target.
 */
export const WithLabel: Story = {
  render: (args) => (
    <label htmlFor="consent" className="flex items-center gap-2">
      <Checkbox {...args} id="consent" name="consent" />
      <span className="text-base text-on-surface">
        I&rsquo;ve read and agree to the consent form.
      </span>
    </label>
  ),
};
