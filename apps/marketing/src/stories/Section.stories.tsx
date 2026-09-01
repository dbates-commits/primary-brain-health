import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Container, Eyebrow, Heading, Section } from "@pbh/ui";

const meta = {
  title: 'Components/Section',
  component: Section,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Page section wrapper. Always emits `data-scroll-reveal`, which `ScrollRevealInit` ' +
          'picks up at runtime to fade content in on scroll — inside Storybook there is no ' +
          'observer running, so sections render in their final state. `id` feeds the ' +
          'scroll-anchored nav in the Header.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'bg-background-default py-20',
    children: (
      <Container>
        <Eyebrow>Why Primary Brain Health?</Eyebrow>
        <Heading as="h2" size="lg" className="mt-4">
          Care built around cognition
        </Heading>
      </Container>
    ),
  },
};

/** `id` is the scroll anchor — the Header highlights nav items against it. */
export const WithAnchorId: Story = {
  args: {
    id: 'how-it-works',
    className: 'bg-background-warm py-20',
    children: (
      <Container>
        <Heading as="h2" size="lg">
          How It Works
        </Heading>
        <p className="mt-4 text-text-default">
          Anchored at <code>#how-it-works</code>; `scroll-mt-20` keeps it clear of the fixed header.
        </p>
      </Container>
    ),
  },
};

/** `stagger` sets `data-scroll-stagger`, delaying this section&rsquo;s reveal. */
export const WithStagger: Story = {
  args: {
    stagger: 2,
    className: 'bg-background-default py-20',
    children: (
      <Container>
        <Heading as="h2" size="md">
          Staggered reveal
        </Heading>
        <p className="mt-4 text-text-default">
          Renders <code>data-scroll-stagger=&quot;2&quot;</code> for the reveal script to read.
        </p>
      </Container>
    ),
  },
};
