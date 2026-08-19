import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The design system's type scale (Figma's `Fonts` collection) uses names, not
 * t-shirt sizes: `text-h2`, `text-body-sm`, `text-caption`. tailwind-merge can't
 * tell those from a colour token — both are `text-*` — so out of the box it files
 * them under `text-color` and drops one when a component composes a size and a
 * colour, e.g. `cn("text-caption ...", "text-text-label")`.
 *
 * That failure is silent: the class simply vanishes from the rendered output, so
 * nothing errors and only a computed-style check catches it. Declaring the scale
 * here is what keeps size and colour from cancelling each other out.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
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
          ],
        },
      ],
    },
  },
});

/** Compose class names with clsx + tailwind-merge (last-wins conflict resolution). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
