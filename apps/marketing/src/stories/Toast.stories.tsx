import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Toast } from "@pbh/ui";

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The confirmation toast (Figma 2092:13191): a dark pill, a green tick and one line ' +
          'of copy. Presentation only — no timer and no portal, so the caller decides when it ' +
          'exists and where it sits. `role="status"` announces it without interrupting, which ' +
          'is the right register for "your save worked". It animates in on mount and, when ' +
          '`leaving` flips, back out — the caller keeps it mounted for that exit, since a ' +
          'component cannot animate its own unmount. `ProfileForm` pins it to the top of the ' +
          'page and takes it down after four seconds.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-background-brand-subtle p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What a saved profile shows. */
export const Default: Story = {
  args: { message: 'Changes saved successfully' },
};

/** The pill is sized by its copy — it has no fixed width. */
export const LongMessage: Story = {
  args: { message: 'Your details were saved and sent for review' },
};
