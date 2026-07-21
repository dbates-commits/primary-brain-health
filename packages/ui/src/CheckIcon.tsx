import type { SVGProps } from "react";

/**
 * Bare checkmark glyph, drawn in `currentColor` so the caller controls the
 * colour with a text utility. Deliberately distinct from `<Icon name="check" />`,
 * which is a check *inside a circle* — this one is just the tick, for cases
 * where the surrounding shape is drawn by something else (see {@link "./Checkbox"}).
 *
 * The 16×16 viewBox means a caller sizing it larger than the glyph should add
 * padding (`size-6 p-1` renders a 16px tick in a 24px box) rather than scaling it.
 */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M13 4.5 6.5 11 3 7.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
