import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Container } from "@pbh/ui";

const meta = {
  title: 'Components/Container',
  component: Container,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['narrow', 'default', 'wide', 'full'] },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

const filler = (label: string) => (
  <div className="rounded-lg bg-secondary/15 py-12 text-center text-sm text-on-surface-variant">
    {label}
  </div>
);

/** `max-w-6xl` — the standard page width. */
export const Default: Story = {
  args: {
    size: 'default',
    children: filler('default — max-w-6xl'),
  },
};

/** `max-w-3xl` — long-form prose, where measure matters more than width. */
export const Narrow: Story = {
  args: {
    size: 'narrow',
    children: filler('narrow — max-w-3xl'),
  },
};

/** `max-w-7xl` — galleries and wide multi-column layouts. */
export const Wide: Story = {
  args: {
    size: 'wide',
    children: filler('wide — max-w-7xl'),
  },
};

/** No max width; the responsive gutters still apply. */
export const Full: Story = {
  args: {
    size: 'full',
    children: filler('full — max-w-full'),
  },
};

/** All four widths stacked, so the steps between them are visible at a glance. */
export const AllSizes: Story = {
  args: { children: null },
  render: () => (
    <div className="space-y-4 bg-surface py-8">
      <Container size="narrow">{filler('narrow')}</Container>
      <Container size="default">{filler('default')}</Container>
      <Container size="wide">{filler('wide')}</Container>
      <Container size="full">{filler('full')}</Container>
    </div>
  ),
};
