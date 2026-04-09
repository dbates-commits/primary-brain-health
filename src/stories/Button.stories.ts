import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Button } from '@/components/shared/Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimarySolid: Story = {
  args: {
    children: 'Book a Consultation',
    variant: 'solid',
    color: 'primary',
    size: 'md',
  },
};

export const SecondarySolid: Story = {
  args: {
    children: 'Learn More',
    variant: 'solid',
    color: 'secondary',
    size: 'md',
  },
};

export const PrimaryOutline: Story = {
  args: {
    children: 'Book a Consultation',
    variant: 'outline',
    color: 'primary',
    size: 'md',
  },
};

export const SecondaryOutline: Story = {
  args: {
    children: 'Learn More',
    variant: 'outline',
    color: 'secondary',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'View Details',
    variant: 'ghost',
    color: 'primary',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    variant: 'solid',
    color: 'primary',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'solid',
    color: 'primary',
    size: 'lg',
  },
};

export const AsLink: Story = {
  args: {
    children: 'Book a Consultation',
    href: '#intake',
    variant: 'solid',
    color: 'primary',
    size: 'md',
  },
};
