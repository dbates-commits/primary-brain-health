/**
 * Inline field error. Pass the matching `id` so the input can reference it via
 * `aria-describedby`; `role="alert"` makes screen readers announce it the
 * moment it appears. (The `animate-error-in` keyframe is defined per-app in
 * `globals.css`; without it the message simply appears without the animation.)
 */
export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} role="alert" className="animate-error-in mt-1 text-sm text-error">
      {message}
    </p>
  );
}
