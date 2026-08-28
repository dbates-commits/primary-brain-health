import type { SVGProps } from "react";

/**
 * Filled green disc with a white tick — the toast's confirmation glyph
 * (Figma 2092:13192), exported verbatim from the design.
 *
 * Distinct from both {@link "./CheckIcon"} (a bare tick in `currentColor`) and
 * `<Icon name="check" />` (a tick in an *outlined* circle). The two colours are
 * set here rather than taken from `currentColor` because the disc and the tick
 * differ; the caller sizes it and nothing else.
 *
 * The disc is `--color-accent-green-strong`, which is a different green again
 * from `accent-green` (#85c559) and has no Figma variable — see FIG-02.
 */
export function SuccessCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" {...props}>
      <circle
        cx="12"
        cy="12"
        r="12"
        fill="var(--color-accent-green-strong)"
      />
      <path
        d="M7 12L10.5 15.75L17 8.25"
        stroke="var(--color-text-inverse)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
