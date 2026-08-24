"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface FocusTrapOptions {
  /**
   * Whether the trap is live. Pass the *open* flag, not the mounted one: an
   * overlay that animates out is still in the tree for 200ms after closing, and
   * a trap still listening would fight the caller for focus — which is exactly
   * what happens when closing hands focus back to the control that opened it.
   */
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  /** Escape is the caller's to interpret: dismiss, or step back a layer. */
  onEscape: () => void;
  /**
   * Selector for the element to focus on open. Defaults to the first focusable
   * in the container.
   */
  initialFocus?: string;
}

/**
 * Keep keyboard focus inside `containerRef` while `active`: move focus in on
 * open, cycle Tab/Shift+Tab within it, and route Escape to the caller.
 *
 * Lifted from `booking/Modal`, minus the focus *restoration*. Restoring on
 * unmount only works when the element that had focus is still reachable, and an
 * overlay layered over an `inert` region 200ms later has no guarantee of that —
 * a restore into an inert node silently drops focus to `<body>`. Callers place
 * focus explicitly instead, the way `LoginMenu` does with its trigger ref.
 */
export function useFocusTrap({
  active,
  containerRef,
  onEscape,
  initialFocus,
}: FocusTrapOptions): void {
  useEffect(() => {
    if (!active) {
      return;
    }

    const container = containerRef.current;
    const focusables = () =>
      container
        ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
        : [];

    const preferred = initialFocus
      ? container?.querySelector<HTMLElement>(initialFocus)
      : null;
    (preferred ?? focusables()[0] ?? container)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape();
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
    };
  }, [active, containerRef, onEscape, initialFocus]);
}
