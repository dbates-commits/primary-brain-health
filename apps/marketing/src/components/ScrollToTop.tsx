"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Resets scroll to the top instantly on every route change.
 *
 * Two behaviours combined:
 *   1. `history.scrollRestoration = "manual"` once on mount — prevents
 *      the browser from restoring a previous scroll position on back/
 *      forward navigation, which is the most surprising behaviour.
 *   2. On each pathname change, jump to (0, 0) — but only when the URL
 *      has no hash, so anchor links like `/contact#form` still scroll
 *      to the anchor instead of the top.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
