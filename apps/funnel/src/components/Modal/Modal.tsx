"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { PhosphorIcon } from "@pbh/ui";

/** Selector for the elements a focus trap should cycle through. */
const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog rendered into a portal on `document.body`.
 *
 * Handles the pieces the funnel has never needed before (no dialog primitive
 * existed): a dimmed overlay, `Esc` / overlay-click dismissal, a focus trap that
 * returns focus to the trigger on close, body scroll-lock, and the
 * `role="dialog"` / `aria-modal` wiring. The card body scrolls on its own so the
 * taller steps (consent, payment) fit small viewports.
 */
export function Modal({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog (each step also renders a visible heading). */
  label: string;
  children: ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  // Element focused before the modal opened, so we can restore it on close.
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const card = cardRef.current;
      if (!card) {
        return;
      }
      const focusable = Array.from(
        card.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  // Lock body scroll, remember + move focus into the card, and restore focus on
  // close. Runs only while open.
  useEffect(() => {
    if (!open) {
      return;
    }
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first field (or the card) once mounted.
    const card = cardRef.current;
    const firstFocusable = card?.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? card)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        // Only dismiss on clicks that start on the overlay itself, not on a
        // drag that ends there from inside the card.
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative my-auto w-full max-w-[560px] rounded-2xl bg-surface p-6 shadow-2xl outline-none sm:p-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <PhosphorIcon name="X" size={20} weight="bold" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
