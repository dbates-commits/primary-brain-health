import type { ReactNode } from "react";
import { cn } from "@pbh/ui";

/**
 * The booking modal's panel, minus the portal and the focus trap.
 *
 * The step forms are built to live inside `Modal` (`apps/marketing/src/
 * components/booking/Modal.tsx`): a `min-h-0 flex-1 overflow-y-auto` body with
 * no bottom padding. `StickyActions` pins against that scroll container, so a
 * step rendered on a bare page never shows its real behaviour. This shell
 * reproduces the same box for stories.
 *
 * Kept deliberately dumb — no Escape handling, no scroll lock, no portal — so a
 * story exercises the step, not the dialog. It also omits `Modal`'s optional
 * pinned header region: every step here renders its own header inline, which is
 * the `showHeader` default.
 *
 * Height mirrors `Modal`, which holds the stepping screens at the viewport less
 * its margin (1.25rem, 40px from `sm`) — fixed, not capped. Without it a story
 * panel would hug its step and the action bar would sit under the last field,
 * which is the one thing these stories exist to show.
 *
 * `sizeToContent` is the same escape hatch `Modal` has, for the screens outside
 * the stepper: the panel hangs from the top margin, grows down and caps at the
 * viewport. The email gate is the one caller.
 */
export function BookingModalShell({
  children,
  sizeToContent = false,
}: {
  children: ReactNode;
  sizeToContent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-dvh justify-center bg-ink-strong/50 px-4 py-[1.25rem] sm:py-[40px]",
        sizeToContent ? "items-start" : "items-center",
      )}
    >
      <div
        className={cn(
          "relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-background-default shadow-2xl",
          sizeToContent
            ? "max-h-[calc(100dvh-2.5rem)] sm:max-h-[calc(100dvh-80px)]"
            : "h-[calc(100dvh-2.5rem)] sm:h-[calc(100dvh-80px)]",
        )}
      >
        {/* `pr-14`/`pt-*` are Modal's no-header branch: with no pinned header the
            body owns the top padding and clears the close button. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pr-14 pt-6 sm:px-8 sm:pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
