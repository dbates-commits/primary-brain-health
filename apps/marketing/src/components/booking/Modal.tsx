"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
  /**
   * Optional full-bleed band above everything, drawn edge to edge with no
   * padding of its own — the booking stepper is the one caller. Deliberately not
   * folded into `header`: that region is inset by `px-6 … sm:px-8` with a
   * `pr-14` gutter for the close button, which a bordered band spanning the
   * panel cannot live inside.
   */
  banner?: ReactNode;
  /**
   * Hold the panel at its full height instead of sizing it to the step.
   *
   * The booking step screens (details, consent, payment) differ enough in
   * height that the panel visibly jumps between them, which moves the button
   * the customer is reaching for. Fixing the height parks it. The screens that
   * don't opt in — the overview and the email gate — are short enough that a
   * full-height panel would be mostly empty box.
   */
  fillHeight?: boolean;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * How long the open/close transition runs. Must stay in step with the
 * `duration-200` classes below — this is the timer that keeps the modal mounted
 * long enough for the exit animation to finish, so a mismatch either clips the
 * animation or leaves an invisible overlay swallowing clicks.
 */
const TRANSITION_MS = 200;

/**
 * The tallest the panel may be: the viewport less the 30px it is inset from the
 * top and bottom edges. `fillHeight` turns this same measurement into a fixed
 * height; without it the panel sizes to its content and this is only a cap.
 */
const PANEL_MAX_HEIGHT = "max-h-[calc(100dvh-60px)]";

/**
 * Accessible modal dialog rendered into a portal on `document.body`. Handles the
 * a11y basics a raw overlay misses: Escape to close, backdrop click to close,
 * body scroll lock, a focus trap (Tab/Shift+Tab cycle within the panel), initial
 * focus into the panel, and focus restoration to the trigger on close.
 *
 * Portal-safe for SSR: it renders `null` until it has mounted on the client, so
 * `document` is always defined when the portal mounts.
 *
 * Open and close are animated, which means the modal outlives `open` going
 * false: `mounted` keeps it in the tree until the exit transition has run.
 * `entered` flips a frame *after* mounting so the browser paints the closed
 * state first — mount and animate in one pass and there is no start value to
 * animate from, so nothing moves.
 */
export function Modal({
  open,
  onClose,
  label,
  header,
  banner,
  fillHeight = false,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);

  // Mounting is derived from `open`, not synced to it in an effect: it has to
  // happen in the same render pass, or the first frame after opening paints
  // nothing. This is React's documented adjust-state-during-render pattern.
  if (open && !mounted) {
    setMounted(true);
  }

  /** Drives the transition classes. Falls to false the moment `open` does. */
  const shown = open && entered;

  useEffect(() => {
    if (open) {
      // Double rAF: the first lands in the frame that commits the mount, the
      // second in the one after it has been painted — so there is a start value
      // to animate from.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    const timer = setTimeout(() => {
      setMounted(false);
      setEntered(false);
    }, TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    // Held for as long as the modal is in the tree, exit animation included:
    // releasing it when `open` flips would let the page jump behind a modal
    // that is still on screen.
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
  }, [mounted, onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        // The vertical inset is the panel's margin from the viewport edge, and
        // `PANEL_MAX_HEIGHT` is its complement — the two are one measurement and
        // have to move together. 30px is a viewport margin rather than a step on
        // the spacing scale, which is why it is written out.
        "fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-ink-strong/50 px-4 py-[30px]",
        "transition-opacity duration-200 ease-out motion-reduce:transition-none",
        shown ? "opacity-100" : "opacity-0",
      )}
      onMouseDown={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-background-default shadow-2xl focus:outline-none",
          PANEL_MAX_HEIGHT,
          // A definite height, so the panel stops tracking its content. The
          // body below is already `min-h-0 flex-1 overflow-y-auto`, so the
          // overflow lands in the right place the moment there is a height to
          // overflow; the steps push their action bars down to meet it.
          fillHeight && "h-[calc(100dvh-60px)]",
          // `transition` (not `transition-all`) already covers opacity and
          // transform, and leaves layout properties alone — the panel's height
          // changes between steps and must not animate.
          "transition duration-200 ease-out motion-reduce:transition-none",
          shown ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {banner ? <div className="shrink-0">{banner}</div> : null}
        {/* Everything below the banner. The close button is positioned against
            *this* box rather than the panel, so a band at the top pushes it down
            instead of having it land on the band's own content. With no banner
            this is a pass-through flex column and the geometry is unchanged. */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 rounded-full p-2 text-text-default transition-colors hover:bg-background-warm hover:text-ink-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-default"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6"
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
            <div className="shrink-0 px-6 pb-4 pr-14 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
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
              "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 sm:px-8",
              // No fixed header → the body owns the top padding. The gutter for
              // the close button is *not* here: this box is the whole scrolling
              // column, so a right padding on it insets every row of every step
              // by 56px to clear a button that occupies the top corner alone.
              // The content that actually sits under the button clears it
              // itself — see `BookingOverviewPane`.
              header ? "" : "pt-6 sm:pt-8",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
