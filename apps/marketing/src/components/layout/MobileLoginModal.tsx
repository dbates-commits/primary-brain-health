"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import { PhosphorIcon, cn } from "@pbh/ui";
import type { LoginState } from "@/app/login/actions";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { LoginPanel } from "./LoginPanel";
import { usePopoverTransition } from "./use-popover-transition";

interface MobileLoginModalProps {
  open: boolean;
  /** Step back to the drawer underneath, which stays open behind this. */
  onBack: () => void;
  /** Dismiss the whole stack — this and the drawer. */
  onClose: () => void;
  action: (prev: LoginState, formData: FormData) => Promise<LoginState>;
}

/**
 * The mobile sign-in surface (Figma 2155:12230): a full-bleed layer over the
 * drawer holding the same `LoginPanel` the desktop popover uses.
 *
 * **Portalled to `document.body`, and that is not cosmetic.** The header carries
 * `backdrop-blur-xl` once the page is scrolled, and `backdrop-filter` makes a
 * containing block for `position: fixed` descendants — rendered inside the nav,
 * this would be trapped in the header's box the moment anyone scrolls.
 *
 * Not built on `booking/Modal`: that dialog is a centred card over a dark
 * backdrop with its own close button, and none of that survives here. What the
 * two genuinely share is invisible — the scroll lock and the focus trap — and
 * those are the hooks this imports.
 *
 * The drawer stays open underneath the whole time, which is what makes the back
 * arrow an uncover rather than a re-open. `aria-modal` is what excludes the
 * drawer from the accessibility tree while it is covered.
 */
export function MobileLoginModal({
  open,
  onBack,
  onClose,
  action,
}: MobileLoginModalProps) {
  const { mounted, shown } = usePopoverTransition(open);
  const containerRef = useRef<HTMLDivElement>(null);

  useScrollLock(mounted);
  useFocusTrap({
    active: open,
    containerRef,
    // Escape closes the top layer and reveals the drawer beneath it, rather
    // than dismissing both — the layer below is still a menu the user was in.
    onEscape: onBack,
    initialFocus: "input",
  });

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      // Same accessible name as the desktop popover, so one query finds the
      // sign-in dialog at either breakpoint.
      aria-label="Login"
      // `pointer-events-none` alongside `inert`: belt and braces, so a panel
      // that is fading out can never swallow a tap meant for the drawer.
      inert={!open}
      className={cn(
        "fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-surface",
        // The surface only fades. It must not move: this layer's X sits
        // exactly on top of the drawer's, and translating the sheet would
        // slide one off the other for the length of the transition. The rise
        // is on the card below instead, which nothing has to line up with.
        "transition-opacity duration-200 ease-out motion-reduce:transition-none",
        shown ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {/* Mirrors the header row this covers, class for class: `py-5` around a
          40px child gives the same 80px height, `px-6 lg:px-10 max-w-[90rem]
          mx-auto` puts the right edge in the same place, and the `p-2` box
          around a 24px icon is the hamburger's own geometry. That is what keeps
          the X from moving when the drawer's X becomes this one — Figma draws
          the row at 78px, and matching the header instead is a deliberate 2px
          deviation. `gap-6` between two `p-2` boxes leaves the design's 40px
          between the icons themselves. */}
      <div className="mx-auto flex w-full max-w-[90rem] items-center justify-end gap-6 px-6 py-5 lg:px-10">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to menu"
          className="p-2 text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <PhosphorIcon name="ArrowCircleLeft" size={24} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="p-2 text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <PhosphorIcon name="X" size={24} aria-hidden="true" />
        </button>
      </div>

      {/* Figma pins this card at `left: 20 / top: 78 / width: 362`, which on a
          402pt frame is just "the gutters". Expressed as the header's own
          container it holds at every width, and the card's left edge lines up
          with the logo above it. */}
      <div
        className={cn(
          "mx-auto w-full max-w-[90rem] px-6 lg:px-10",
          "transition-transform duration-200 ease-out motion-reduce:transition-none",
          shown ? "translate-y-0" : "translate-y-2",
        )}
      >
        <LoginPanel
          action={action}
          onDone={onClose}
          className="gap-4 p-5 drop-shadow-[0px_4px_12px_rgba(0,0,0,0.12)]"
        />
      </div>
    </div>,
    document.body,
  );
}
