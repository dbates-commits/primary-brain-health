/** Shared form styling + helpers for the get-started step forms. */

export const fieldClass =
  "mt-1 w-full rounded-lg border border-outline/40 bg-surface px-4 py-2.5 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export const labelClass = "block text-sm font-medium text-on-surface";

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p className="animate-error-in mt-1 text-sm text-error">{message}</p>
  );
}
