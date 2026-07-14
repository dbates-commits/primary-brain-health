"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@pbh/ui";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the dialog (announced by screen readers). */
  label: string;
  /**
   * Optional fixed header, pinned above the scrollable body so only the body
   * (and its scrollbar) scrolls. Steps that render their own header can omit this
   * and pass it as `children` instead.
   */
  header?: ReactNode;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog rendered into a portal on `document.body`. Handles the
 * a11y basics a raw overlay misses: Escape to close, backdrop click to close,
 * body scroll lock, a focus trap (Tab/Shift+Tab cycle within the panel), initial
 * focus into the panel, and focus restoration to the trigger on close.
 *
 * Portal-safe for SSR: it renders `null` until `open` flips true (a client-only
 * event), so `document` is always defined when the portal mounts.
 */
export function Modal({ open, onClose, label, header, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = () =>
      panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];

    // Move focus into the dialog once it opens.
    (focusables()[0] ?? panel)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") {
        return;
      }
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-on-surface/50 p-4"
      onMouseDown={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl focus:outline-none"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {/* Fixed header region (title + description) — stays put while only the
            body below scrolls, so the scrollbar spans the content, not the whole
            modal. `pr-14` keeps the title clear of the close button. */}
        {header ? (
          <div className="shrink-0 px-6 pb-4 pr-14 pt-6 sm:px-10 sm:pt-10">
            {header}
          </div>
        ) : null}
        <div
          className={cn(
            // No bottom padding here on purpose: a padding-bottom on the scroll
            // container insets where a `sticky bottom-0` child pins, leaving the
            // step's action bar short of the edge with content scrolling beneath
            // it. Each step supplies its own bottom padding instead — via
            // `StickyActions` on the steps that pin their actions, and directly
            // on the ones that don't (payment, done).
            "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 sm:px-10",
            // No fixed header → the body owns the top padding (and clears the
            // close button on the right).
            header ? "" : "pr-14 pt-6 sm:pt-10",
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
