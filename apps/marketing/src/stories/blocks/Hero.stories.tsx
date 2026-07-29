import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Hero } from "@/components/blocks/Hero";
import { IMAGES } from "../fixtures";

const meta = {
  title: 'Blocks/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The page hero. `Hero` is a thin pass-through to `HeroFullImage`, so these stories ' +
          'exercise the same markup the site renders. The phrase "Brain Health" is picked out ' +
          'of the headline and coloured automatically by `highlightBrainHealth` — the copy ' +
          'carries no markup. Trust avatars load from Unsplash, so they need network access.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    theme: { control: 'inline-radio', options: ['light', 'dark', 'primary', 'secondary'] },
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    headline: 'Take control of your Brain Health',
    subheadline:
      'A clinician-reviewed cognitive baseline, and a plan built around what it tells you.',
    trustText: 'Trusted by over 2,000 members',
    image: IMAGES.laughingCouple,
    primaryButtonText: 'Book a Consultation',
    primaryButtonLink: '#intake',
  },
};

/** Headlines without the phrase "Brain Health" render with no highlight span. */
export const WithoutHighlightPhrase: Story = {
  args: {
    ...Default.args,
    headline: 'Know where your cognition stands today',
  },
};

/** Mobile CTAs get a shorter label via `primaryButtonTextMobile`. */
export const ShortMobileCta: Story = {
  args: {
    ...Default.args,
    primaryButtonText: 'Book Your Consultation Today',
    primaryButtonTextMobile: 'Book Now',
  },
};

/** No trust line — the avatar row and its copy are both omitted. */
export const WithoutTrustText: Story = {
  args: {
    ...Default.args,
    trustText: undefined,
  },
};

/** Falls back to `DEFAULT_HERO_IMAGE` when the CMS has no image set. */
export const NoImage: Story = {
  args: {
    ...Default.args,
    image: undefined,
  },
};

/** Stress test: long headline and subheadline, to check the text balance. */
export const LongCopy: Story = {
  args: {
    ...Default.args,
    headline: 'A measured, clinician-led approach to your Brain Health as you age',
    subheadline:
      'Most cognitive change begins two decades before symptoms appear. A validated baseline tells you where you stand now, and what is worth acting on — reviewed by a clinician, not an algorithm.',
  },
};

/** Alternate consultation photography. */
export const AlternateImage: Story = {
  args: {
    ...Default.args,
    image: IMAGES.heroConsultation,
  },
};
