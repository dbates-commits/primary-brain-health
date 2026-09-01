import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The named font sizes from `@pbh/tokens` (Figma's `Fonts` collection).
 *
 * These have to be registered or `cn()` silently drops them. tailwind-merge
 * ships `{ color: [isAny], text: [isTshirtSize] }`: any colour name is accepted
 * as a colour, so the Figma colour tokens need no registration at all — but
 * `body-sm` and `h2` are not t-shirt sizes, so `text-body-sm` falls through the
 * font-size group into the *colour* group. `cn("text-caption", "text-text-default")`
 * then reads as two colours and keeps only the last, dropping the size with no
 * error anywhere.
 *
 * Anything added to the `--text-*` scale in theme.css must be added here too.
 * `utils.test.ts` is the guard.
 */
export const TYPE_SCALE = [
  "display",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "subtitle",
  "heading-small",
  "body-lg",
  "body",
  "body-sm",
  "caption",
] as const;

const twMerge = extendTailwindMerge({
  extend: { theme: { text: [...TYPE_SCALE] } },
});

/** Compose class names with clsx + tailwind-merge (last-wins conflict resolution). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
