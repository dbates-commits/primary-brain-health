import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { TokenSwatches } from './TokenSwatches';
import {
  CODE_ONLY_COLORS,
  PRIMITIVE_COLORS,
  RADII,
  SEMANTIC_COLORS,
  STEPPER_COLORS,
  TYPE_STEPS,
  type Swatch,
} from './tokens';

/**
 * The design-system reference page, and the only check that proves a token
 * actually reaches the browser.
 *
 * `tokens.node.test.ts` proves each token is declared in theme.css and mirrored
 * into `@theme inline`. It cannot prove Tailwind emitted a utility for it —
 * that depends on the class appearing in scanned source, on the `@source`
 * directives, and on the merge config. When it doesn't, the utility is simply
 * absent and the element paints transparent; nothing errors, and the class list
 * in the source still reads as correct.
 *
 * So every assertion here measures `getComputedStyle`, never a class name.
 */
const meta = {
  title: 'Design System/Tokens',
  component: TokenSwatches,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Every token in `@pbh/tokens`, under its Figma variable name. Values ' +
          'come from `docs/design-tokens-figma-export.json`; see `docs/design-tokens.md`.',
      },
    },
  },
} satisfies Meta<typeof TokenSwatches>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Assert each swatch paints the colour Figma resolves its variable to. */
const expectColors = (root: HTMLElement, swatches: Swatch[]) => {
  const canvas = within(root);
  for (const swatch of swatches) {
    const el = canvas.getByTestId(swatch.className);
    expect(
      getComputedStyle(el).backgroundColor,
      `${swatch.className} (${swatch.figma ?? 'code-only'})`,
    ).toBe(swatch.rgb);
  }
};

/** What components should reach for. */
export const Semantic: Story = {
  args: { title: 'Semantic colours', swatches: SEMANTIC_COLORS },
  play: ({ canvasElement }) => expectColors(canvasElement, SEMANTIC_COLORS),
};

export const Stepper: Story = {
  args: { title: 'Stepper', swatches: STEPPER_COLORS },
  play: ({ canvasElement }) => expectColors(canvasElement, STEPPER_COLORS),
};

/** The raw ramps. Rendered mainly so a missing mirror is caught here. */
export const Primitives: Story = {
  args: { title: 'Primitives', swatches: PRIMITIVE_COLORS },
  play: ({ canvasElement }) => expectColors(canvasElement, PRIMITIVE_COLORS),
};

/** Values the design uses that Figma does not name — see FIG-02 and FIG-03. */
export const CodeOnly: Story = {
  args: { title: 'No Figma variable yet', swatches: CODE_ONLY_COLORS },
  play: ({ canvasElement }) => expectColors(canvasElement, CODE_ONLY_COLORS),
};

/**
 * The type scale and the radii. Both are rendered with literal utility classes
 * for the same reason the colours are, and measured the same way.
 */
export const Typography: Story = {
  args: { title: 'Type scale', swatches: [] },
  render: () => (
    <section>
      <h2 className="mb-3 font-headline text-h5 text-text-heading">Type scale</h2>
      <div className="flex flex-col gap-2">
        {TYPE_STEPS.map((step) => (
          <div key={step.className} className="flex items-baseline gap-4">
            <code className="w-44 shrink-0 font-body text-caption text-text-secondary">
              {step.className}
            </code>
            <span
              data-testid={step.className}
              className={`font-headline text-text-heading ${step.className}`}
            >
              {step.figma} · {step.px}
            </span>
          </div>
        ))}
      </div>
      <h2 className="mb-3 mt-10 font-headline text-h5 text-text-heading">Radii</h2>
      <div className="flex flex-wrap gap-4">
        {RADII.map((radius) => (
          <div key={radius.className} className="flex flex-col gap-1">
            <div
              data-testid={radius.className}
              className={`h-20 w-28 bg-brand-muted ${radius.className}`}
            />
            <code className="font-body text-caption text-text-secondary">
              {radius.className}
            </code>
          </div>
        ))}
      </div>
    </section>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const step of TYPE_STEPS) {
      expect(
        getComputedStyle(canvas.getByTestId(step.className)).fontSize,
        `${step.className} (${step.figma})`,
      ).toBe(step.px);
    }
    for (const radius of RADII) {
      expect(
        getComputedStyle(canvas.getByTestId(radius.className)).borderTopLeftRadius,
        `${radius.className} (${radius.figma})`,
      ).toBe(radius.px);
    }
  },
};
