import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@pbh/ui";

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'elevated', 'bordered', 'ghost'] },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
    hover: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="w-96 bg-surface p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBody = (
  <>
    <CardHeader>
      <CardTitle>Cognitive Baseline</CardTitle>
      <CardDescription>
        A 30-minute assessment that establishes where your brain health stands today.
      </CardDescription>
    </CardHeader>
    <CardContent>
      Results are reviewed by a clinician and returned within three business days.
    </CardContent>
  </>
);

export const Default: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    children: sampleBody,
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    children: sampleBody,
  },
};

export const Bordered: Story = {
  args: {
    variant: 'bordered',
    padding: 'md',
    children: sampleBody,
  },
};

/** Transparent — for grouping content without a card surface. */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    padding: 'md',
    children: sampleBody,
  },
};

/** `hover` adds the lift + shadow transition used on clickable cards. */
export const Hoverable: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    hover: true,
    children: sampleBody,
  },
};

/** All five sub-components composed together. */
export const FullComposition: Story = {
  args: {
    variant: 'elevated',
    padding: 'lg',
    children: (
      <>
        <CardHeader>
          <CardTitle as="h2">Comprehensive Program</CardTitle>
          <CardDescription>
            Assessment, clinician review, and a personalised 12-month plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          Includes quarterly re-assessment so you can see change over time rather than a
          single snapshot.
        </CardContent>
        <CardFooter>
          <Button variant="solid" color="primary" size="sm">
            Get Started
          </Button>
        </CardFooter>
      </>
    ),
  },
};

/** `padding="none"` so media can bleed to the card edge. */
export const NoPadding: Story = {
  args: {
    variant: 'bordered',
    padding: 'none',
    children: (
      <>
        <div className="h-32 rounded-t-xl bg-secondary" />
        <div className="p-6">
          <CardTitle>Edge-to-edge media</CardTitle>
          <CardDescription>Inner padding is applied by the content, not the card.</CardDescription>
        </div>
      </>
    ),
  },
};
