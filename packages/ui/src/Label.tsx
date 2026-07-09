import type { ReactNode } from "react";
import { cn } from "./utils";

/** Field label: 12px semibold, muted on-surface. */
const labelClass = "block text-xs font-semibold text-on-surface-variant";

/**
 * Form field label. Wraps a native `<label>` with the shared label styling and
 * requires `htmlFor` so every field stays wired to its input for accessibility.
 */
export function Label({
  htmlFor,
  children,
  className,
}: {
  htmlFor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn(labelClass, className)}>
      {children}
    </label>
  );
}
