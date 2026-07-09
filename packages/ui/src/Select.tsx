import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "./utils";
import { fieldBaseClass } from "./form-constants";

/**
 * Styled native `<select>`: the shared filled-field look plus a chevron
 * affordance (native selects can't style their arrow, so we hide it with
 * `appearance-none` and overlay our own). Forwards its ref so callers can drive
 * the value imperatively. The `mt-2` on the wrapper matches a field placed
 * directly under a {@link "./Label"}.
 */
export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative mt-2">
      <select
        ref={ref}
        className={cn(fieldBaseClass, "appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
});
