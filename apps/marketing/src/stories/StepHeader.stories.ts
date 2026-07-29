import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StepHeader } from "@pbh/ui";

const meta = {
  title: 'Components/StepHeader',
  component: StepHeader,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Title + optional subtitle at the top of a form step (funnel get-started, the ' +
          'marketing booking modal). Renders an `h1` because each step owns its page title. ' +
          'The title uses Larken Thin — if the font files are absent from `public/fonts/`, ' +
          'it falls back to the stack in `globals.css`.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StepHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Create your account',
    subtitle: 'We use this to send your results and keep your record secure.',
  },
};

/** Subtitle is optional — the header collapses to just the title. */
export const TitleOnly: Story = {
  args: {
    title: 'Review and confirm',
  },
};

export const LongTitle: Story = {
  args: {
    title: 'Tell us a little about who this assessment is for',
    subtitle: 'It takes about two minutes.',
  },
};

export const LongSubtitle: Story = {
  args: {
    title: 'Consent',
    subtitle:
      'Before we begin, we need your agreement to collect and process health information. You can withdraw consent at any time, and we will delete your assessment data on request.',
  },
};
