import type { SVGProps } from "react";

/**
 * Filled green disc with a white tick — the toast's confirmation glyph
 * (Figma 2092:13192), exported verbatim from the design.
 *
 * Distinct from both {@link "./CheckIcon"} (a bare tick in `currentColor`) and
 * `<Icon name="check" />` (a tick in an *outlined* circle). The fill is baked
 * in rather than taken from `currentColor` because the disc and the tick are
 * two colours; the caller sizes it and nothing else.
 */
export function SuccessCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="12" fill="#4dc78c" />
      <path
        d="M7 12L10.5 15.75L17 8.25"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
