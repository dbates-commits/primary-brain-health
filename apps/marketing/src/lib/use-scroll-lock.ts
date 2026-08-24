"use client";

import { useEffect } from "react";

/**
 * How many locks are currently held. A counter rather than a boolean because
 * two overlays can overlap — one opening while another animates out — and with
 * a plain `document.body.style.overflow = ""` on cleanup the first to unmount
 * would release the lock while the second is still on screen.
 */
let lockCount = 0;

/**
 * Freeze the page behind an overlay for as long as `locked` is true.
 *
 * Hold it for the whole time the overlay is in the tree, exit animation
 * included — releasing it the moment `open` flips lets the page jump behind
 * something the user can still see. `booking/Modal` makes the same choice by
 * keying its lock off `mounted`.
 *
 * The counter only protects locks taken *through this hook*. `booking/Modal`
 * still sets and clears `document.body.style.overflow` itself, so until it
 * adopts this, two overlapping overlays would still have Modal's cleanup
 * release a lock this hook is holding. Nothing stacks them today — the booking
 * modal and the header live on different surfaces — but that is the reason the
 * follow-up exists.
 */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) {
      return;
    }

    lockCount += 1;
    document.body.style.overflow = "hidden";

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = "";
      }
    };
  }, [locked]);
}
