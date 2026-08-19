/**
 * Format up to 10 digits as `(XXX) XXX-XXXX`, live, as the user types.
 *
 * Shared rather than copied: the booking details step and the account page's
 * profile card both write `users.phone`, and the column holds whatever the last
 * writer formatted — so two implementations would eventually store two formats.
 * A helper rather than a component because its consumers are plain `<input>`s
 * with their own refs and controlled state.
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);
  if (digits.length <= 3) {
    return area;
  }
  if (digits.length <= 6) {
    return `(${area}) ${prefix}`;
  }
  return `(${area}) ${prefix}-${line}`;
}
