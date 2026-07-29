import type { ReactNode } from "react";
import { cn } from "@pbh/ui";

/**
 * The booking modal's panel, minus the portal and the focus trap.
 *
 * The step forms are built to live inside `Modal` (`apps/marketing/src/
 * components/booking/Modal.tsx`): a fixed header region above a `min-h-0
 * flex-1 overflow-y-auto` body with no bottom padding. `StickyActions` pins
 * against that scroll container, so a step rendered on a bare page never shows
 * its real behaviour. This shell reproduces the same box for stories.
 *
 * Kept deliberately dumb — no Escape handling, no scroll lock, no portal — so a
 * story exercises the step, not the dialog.
 */
export function BookingModalShell({
  header,
  children,
}: {
  /** Pinned header region. Pair with the step's own `showHeader={false}`. */
  header?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[32rem] items-center justify-center bg-on-surface/50 p-4">
      <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl">
        {header ? (
          <div className="shrink-0 px-6 pb-4 pr-14 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
            {header}
          </div>
        ) : null}
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 sm:px-8",
            header ? "" : "pr-14 pt-6 sm:pt-8",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
