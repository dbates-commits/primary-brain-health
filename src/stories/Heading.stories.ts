import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Heading } from '@/components/shared/Heading';

const meta = {
  title: 'Components/Heading',
  component: Heading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExtraLarge: Story = {
  args: {
    as: 'h1',
    size: 'xl',
    children: 'Redefining Cognitive Care',
  },
};

export const Large: Story = {
  args: {
    as: 'h2',
    size: 'lg',
    children: 'Who It\'s For',
  },
};

export const Medium: Story = {
  args: {
    as: 'h2',
    size: 'md',
    children: 'How It Works',
  },
};

export const Small: Story = {
  args: {
    as: 'h3',
    size: 'sm',
    children: 'Feature Title',
  },
};
