"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PhosphorIcon, cn } from "@pbh/ui";
import { requestLoginLinkInline } from "@/app/login/actions";
import { LoginPanel } from "./LoginPanel";
import { usePopoverTransition } from "./use-popover-transition";

/**
 * The `Login ⌄` header item and the panel it opens (Figma 1988:10483 for the
 * trigger, 1988:9756 for the open state).
 *
 * Deliberately not built on `components/booking/Modal`: that portals to
 * `document.body` behind a backdrop and locks page scroll, which is right for a
 * blocking booking step and wrong for a nav popover you can dismiss by looking
 * away. What it does borrow is the a11y floor — Escape to close, click-outside
 * to close, focus moved in on open and restored to the trigger on close.
 *
 * Desktop only. The mobile drawer renders `LoginPanel` inline instead, so there
 * is one form and one code path rather than two behaviours to keep in step.
 */
export function LoginMenu() {
  const [open, setOpen] = useState(false);
  const { mounted, shown } = usePopoverTransition(open);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  function close({ restoreFocus = false }: { restoreFocus?: boolean } = {}) {
    setOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }

  // Move focus into the email field once the panel is on screen, so opening
  // from the keyboard lands somewhere useful rather than leaving focus on a
  // trigger whose content has moved below it.
  useEffect(() => {
    if (!open) {
      return;
    }
    wrapperRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close({ restoreFocus: true });
      }
    }

    // `pointerdown`, not `click`: a click that starts inside the panel and ends
    // outside it (drag-selecting the email you just typed) fires `click` on the
    // document and would close the panel mid-gesture.
    function onPointerDown(e: PointerEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        close();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // Tabbing past the last field should dismiss the popover rather than leave it
  // hanging open behind the content you've moved on to. `relatedTarget` is null
  // when focus leaves for the page background, which `pointerdown` already
  // handles — so only act on a real onward target.
  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (e.relatedTarget && !wrapperRef.current?.contains(e.relatedTarget)) {
      close();
    }
  }

  return (
    <div ref={wrapperRef} onBlur={handleBlur} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? panelId : undefined}
        className="flex cursor-pointer items-center gap-1 font-body text-base font-medium tracking-tight text-brand-default transition-all hover:brightness-110"
      >
        Login
        <PhosphorIcon name="CaretDown" size={16} aria-hidden="true" />
      </button>

      {mounted && (
        <LoginPanel
          id={panelId}
          role="dialog"
          aria-label="Login"
          // Out of the tab order and unclickable while it animates away — it
          // outlives `open` by the length of the transition.
          inert={!open}
          action={requestLoginLinkInline}
          onDone={() => close({ restoreFocus: true })}
          className={cn(
            // Anchored 20px right of the trigger and 16px below it, which is
            // where the panel sits against the nav in 1988:9756 — its right
            // edge lands short of the "Book a Consultation" button rather than
            // flush with the trigger. Verified against the rendered box, not
            // the class.
            "absolute top-full -right-5 z-50 mt-4 w-[470px]",
            // Same 200ms ease-out as the booking modal, but scaled from the
            // top-right so it reads as opening *out of* the trigger rather
            // than growing from its own middle.
            "origin-top-right transition duration-200 ease-out motion-reduce:transition-none",
            shown ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        />
      )}
    </div>
  );
}
