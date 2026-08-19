"use client";

import { useEffect, useState } from "react";

/**
 * How long the open/close transition runs. Must stay in step with the
 * `duration-200` classes on the panels — this is the timer that keeps a closing
 * popover mounted long enough to animate out, so a mismatch either clips the
 * animation or leaves an invisible panel in the tree.
 *
 * Same 200ms as `components/booking/Modal`, deliberately: the header popovers
 * and the booking modal should feel like the same surface opening.
 */
const TRANSITION_MS = 200;

export interface PopoverTransition {
  /** Whether the panel should be in the tree at all. Outlives `open`. */
  mounted: boolean;
  /** Whether it should be painted open. Drives the transition classes. */
  shown: boolean;
}

/**
 * Mount/animate bookkeeping for the header popovers, lifted out of `LoginMenu`
 * and `UserMenu` so the two can't drift out of step.
 *
 * The awkward parts, both borrowed from `Modal`:
 *
 * - **Mounting is derived during render, not synced in an effect.** Do it in an
 *   effect and the first frame after opening paints nothing. This is React's
 *   documented adjust-state-during-render pattern.
 * - **`entered` flips a frame *after* mounting**, via a double rAF — the first
 *   lands in the frame that commits the mount, the second after it has been
 *   painted. Mount and animate in one pass and there is no start value to
 *   animate from, so nothing moves.
 */
export function usePopoverTransition(open: boolean): PopoverTransition {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);

  if (open && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (open) {
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

  return { mounted, shown: open && entered };
}
