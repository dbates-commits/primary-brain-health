/** Reusable Tailwind class strings shared across the get-started step forms. */

/**
 * Filled input style from the funnel designs: warm-gray fill, no border, 48px
 * tall, 8px radius. Applies to `<input>` and `<select>`.
 *
 * A class string (not a component wrapper) because it's shared across different
 * native elements — `<input>`, `<select>`, future `<textarea>` — each with its
 * own props/refs. Revisit a wrapper if the forms grow.
 */
export const fieldClass =
  "mt-2 h-12 w-full rounded-lg bg-surface-container-low px-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary";
