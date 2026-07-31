/** Reusable Tailwind class strings shared across the form flows (funnel + marketing). */

/**
 * The filled-field look from the designs: warm-gray fill, no border, 48px tall,
 * 8px radius. This base carries no outer margin so it can sit inside a wrapper
 * (e.g. {@link "./Select"}); {@link fieldClass} adds the top margin used when a
 * field follows a {@link "./Label"} directly.
 *
 * Covers four of the five states in Figma's Text Field (1629:69):
 *
 * - Default — the placeholder, `on-surface-variant`.
 * - Filled  — typed text, `on-surface-warm`. The design distinguishes the two
 *             by colour, which falls out of placeholder-vs-value for free.
 * - Error   — driven by `aria-invalid`, which every form in the funnel already
 *             sets but nothing previously rendered. A RING, not a border:
 *             rings sit outside layout, so an invalid field cannot change
 *             height. A `border-2` would add 4px unless the padding were
 *             compensated with an arbitrary value.
 * - Disabled — dimmed value plus a not-allowed cursor. (The label is not
 *             dimmed; fields are disabled through `<fieldset disabled>`, which
 *             cascades to controls but not to labels.)
 *
 * - Focus   — Figma's `border/default` #d8d8d8, drawn as a ring rather than a
 *             border for the same layout reason as the error state.
 *
 * ACCESSIBILITY NOTE: #d8d8d8 on the #f5f3ee fill is roughly 1.2:1, well under
 * the 3:1 that WCAG 2.2 SC 1.4.11 asks of a focus indicator. This follows the
 * design as drawn; raising the contrast is a design decision, not a code one.
 * Anyone revisiting this: darkening the ring is a one-token change.
 *
 * An invalid field keeps its pink ring while focused: Tailwind orders variants
 * by its own precedence rather than by the order they appear here, and
 * `aria-invalid:` wins. That is the behaviour we want anyway — the error should
 * not vanish the moment you click into the field to fix it. Verified in-browser.
 */
export const fieldBaseClass =
  "h-12 w-full rounded-lg bg-surface-container-low px-3.5 text-sm text-on-surface-warm placeholder:text-on-surface-variant disabled:text-neutral-400 disabled:cursor-not-allowed aria-invalid:ring-2 aria-invalid:ring-accent-pink focus:outline-none focus:ring-2 focus:ring-neutral-350";

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
  "mt-2 w-full rounded-lg bg-surface-container-low px-3.5 py-3 text-sm text-on-surface-warm placeholder:text-on-surface-variant disabled:text-neutral-400 disabled:cursor-not-allowed aria-invalid:ring-2 aria-invalid:ring-accent-pink focus:outline-none focus:ring-2 focus:ring-neutral-350";
