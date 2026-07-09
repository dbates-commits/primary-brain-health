/** Reusable Tailwind class strings shared across the form flows (funnel + marketing). */

/**
 * The filled-field look from the designs: warm-gray fill, no border, 48px tall,
 * 8px radius. This base carries no outer margin so it can sit inside a wrapper
 * (e.g. {@link "./Select"}); {@link fieldClass} adds the top margin used when a
 * field follows a {@link "./Label"} directly.
 */
export const fieldBaseClass =
  "h-12 w-full rounded-lg bg-surface-container-low px-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary";

/**
 * Filled input style for a field placed directly under a {@link "./Label"}.
 * Applies to `<input>` and `<select>`.
 *
 * A class string (not a component wrapper) because it's shared across different
 * native elements — `<input>`, `<select>` — each with its own props/refs.
 */
export const fieldClass = `mt-2 ${fieldBaseClass}`;

/**
 * Multi-line variant of {@link fieldClass}: same fill/radius/focus, but
 * auto-height with vertical padding instead of the fixed 48px row.
 */
export const textareaClass =
  "mt-2 w-full rounded-lg bg-surface-container-low px-3.5 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary";
