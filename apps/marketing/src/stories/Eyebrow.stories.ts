import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Eyebrow } from "@pbh/ui";

const meta = {
  title: 'Components/Eyebrow',
  component: Eyebrow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'inline-radio', options: ['primary', 'secondary'] },
    as: { control: 'inline-radio', options: ['p', 'span', 'div'] },
  },
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Why Primary Brain Health?',
    color: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Restorative Care',
    color: 'secondary',
  },
};

/** `as="span"` when the eyebrow sits inline inside other text. */
export const AsSpan: Story = {
  args: {
    children: 'Our Approach',
    color: 'primary',
    as: 'span',
  },
};

/** The uppercase transform is CSS, so mixed-case source copy still renders correctly. */
export const LongLabel: Story = {
  args: {
    children: 'Clinician-reviewed cognitive assessment',
    color: 'secondary',
  },
};
