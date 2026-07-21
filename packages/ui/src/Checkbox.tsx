import { forwardRef, type InputHTMLAttributes } from "react";
import { CheckIcon } from "./CheckIcon";
import { cn } from "./utils";

/**
 * Styled checkbox: a real `<input type="checkbox">` with its native tick hidden
 * (`appearance-none`, which browsers won't let us restyle) and our own drawn on
 * top. The input keeps every native behaviour — focus, keyboard, form
 * participation, `required` validation — so this is a paint job, not a
 * reimplementation. Mirrors {@link "./Select"}, which hides the native chevron
 * the same way.
 *
 * The tick is revealed by `peer-checked:` rather than by React state, so the
 * checked look never has to be kept in sync with the input. That's also why the
 * icon must stay a *following sibling* of the input inside this wrapper.
 *
 * Forwards its ref to the input so callers can focus it (e.g. to move focus to
 * the first invalid field).
 */
export const Checkbox = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type">
>(function Checkbox({ className, ...props }, ref) {
  return (
    <span className="relative inline-flex size-6 shrink-0">
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "peer size-6 appearance-none rounded-[4px] border border-outline bg-surface transition-colors",
          "checked:border-primary checked:bg-primary",
          "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2",
          className,
        )}
        {...props}
      />
      <CheckIcon className="pointer-events-none absolute inset-0 hidden size-6 p-1 text-on-primary peer-checked:block" />
    </span>
  );
});
