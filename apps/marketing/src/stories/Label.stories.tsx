import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fieldClass, Label } from "@pbh/ui";

const meta = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`htmlFor` is required, so every label is wired to its input — the pairing is ' +
          'enforced by the type signature rather than left to review.',
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
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    htmlFor: 'first-name',
    children: 'First name',
  },
};

/** The pairing this component exists for — clicking the label focuses the input. */
export const WithInput: Story = {
  args: {
    htmlFor: 'email',
    children: 'Email address',
  },
  render: (args) => (
    <div>
      <Label {...args} />
      <input id={args.htmlFor} type="email" placeholder="you@example.com" className={fieldClass} />
    </div>
  ),
};

/** Required markers are content, not a prop — pass the asterisk as part of `children`. */
export const Required: Story = {
  args: {
    htmlFor: 'date-of-birth',
    children: (
      <>
        Date of birth <span className="text-error">*</span>
      </>
    ),
  },
  render: (args) => (
    <div>
      <Label {...args} />
      <input id={args.htmlFor} type="date" required className={fieldClass} />
    </div>
  ),
};

/** Long labels wrap; the block display keeps the field below them. */
export const LongLabel: Story = {
  args: {
    htmlFor: 'referral',
    children: 'How did you hear about Primary Brain Health?',
  },
  render: (args) => (
    <div>
      <Label {...args} />
      <input id={args.htmlFor} type="text" className={fieldClass} />
    </div>
  ),
};
