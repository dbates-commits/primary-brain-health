import { SuccessCircleIcon } from "./SuccessCircleIcon";
import { cn } from "./utils";

/**
 * The confirmation toast (Figma 2092:13191): a dark pill with a green tick and
 * one line of copy.
 *
 * Presentation only — no timer, no portal, no stack. The caller decides when it
 * exists and where it sits, which keeps this usable both pinned over the page
 * and inline in a story. `role="status"` (not `alert`) so a screen reader
 * announces it without interrupting: a save that worked is not an emergency.
 *
 * It animates in on mount and out when `leaving` flips — the caller keeps it
 * mounted for the length of the exit, since a component cannot animate its own
 * unmount. The two classes are picked here rather than merged from outside:
 * tailwind-merge would have to decide whether `animate-toast-out` supersedes
 * `animate-toast-in`, and a wrong guess there fails silently. Both keyframes
 * are defined per-app in `globals.css`, as with `FieldError`; without them the
 * toast simply appears and disappears.
 */
export function Toast({
  message,
  leaving = false,
  className,
}: {
  message: string;
  /** Play the exit animation. Unmount the toast once it has finished. */
  leaving?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        leaving ? "animate-toast-out" : "animate-toast-in",
        "flex items-center gap-3 rounded-xl bg-toast-surface px-5 py-3.5 shadow-toast",
        className,
      )}
    >
      <SuccessCircleIcon className="size-6 shrink-0" />
      <p className="font-body text-body-sm font-medium text-text-inverse">{message}</p>
    </div>
  );
}
