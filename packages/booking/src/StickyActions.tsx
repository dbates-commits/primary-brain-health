"use client";

import type { ReactNode } from "react";
import { cn } from "@pbh/ui";

/**
 * Pins a step's actions to the bottom of the modal's scroll area so the submit
 * button stays reachable on the long steps (details, consent) instead of sitting
 * below the fold. The button stays inside its own `<form>`, so submission,
 * validation and the pending/disabled state are untouched.
 *
 * The blur and the fade above it need no overflow detection: drawn over blank
 * surface they are imperceptible, and they only resolve into view once content
 * actually scrolls behind them. Short steps therefore look exactly as before.
 */
export function StickyActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // The bar — not the scroll container — owns the bottom padding. A
        // padding-bottom on the scroll container insets where `bottom-0` pins,
        // so the bar would stop short and content would scroll visibly beneath
        // it. Modal.tsx therefore leaves its body's bottom padding to the step.
        // Panel→actions gap is owned by the step's own layout gap (32px), so the
        // bar adds no top padding; bottom padding matches the modal's 32px inset.
        "sticky bottom-0 z-10 pb-6 pt-0 sm:pb-8",
        "bg-surface/80 backdrop-blur-md",
        // Fade the scrolling content into the bar instead of cutting it off.
        "before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-8",
        "before:bg-gradient-to-t before:from-surface before:to-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
}
