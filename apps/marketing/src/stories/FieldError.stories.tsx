import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FieldError, fieldClass, Label } from "@pbh/ui";

const meta = {
  title: 'Components/FieldError',
  component: FieldError,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Inline validation message. `role="alert"` announces it the moment it appears; pass ' +
          'the same `id` to the input via `aria-describedby` so the message is reachable from ' +
          'the field. Note the `animate-error-in` keyframe is defined in the funnel app\'s ' +
          '`globals.css`, not marketing\'s — in this Storybook the message appears without ' +
          'the entrance animation.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80 bg-surface p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FieldError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'email-error',
    message: 'Enter a valid email address.',
  },
};

/** No `message` renders `null` — the same call site covers both states. */
export const NoMessage: Story = {
  args: {
    id: 'email-error',
    message: undefined,
  },
};

/** The full a11y wiring: `aria-describedby` + `aria-invalid` on the input. */
export const WiredToInput: Story = {
  args: {
    id: 'email-error',
    message: 'Enter a valid email address.',
  },
  render: (args) => (
    <div>
      <Label htmlFor="email">Email address</Label>
      <input
        id="email"
        type="email"
        defaultValue="not-an-email"
        aria-invalid
        aria-describedby={args.id}
        className={fieldClass}
      />
      <FieldError {...args} />
    </div>
  ),
};

/** Long messages wrap rather than truncate. */
export const LongMessage: Story = {
  args: {
    id: 'password-error',
    message:
      'Password must be at least 12 characters and include an uppercase letter, a number, and a symbol.',
  },
};
