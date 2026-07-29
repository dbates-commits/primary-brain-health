"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A button that opens a URL in a full-screen modal iframe instead of a new tab.
 * Used for both "Start Assessment" and "View My Report". Handles Escape-to-close,
 * body scroll lock, and focusing the close button on open.
 *
 * Note: the target must permit being framed (no `X-Frame-Options: DENY` /
 * restrictive `frame-ancestors` CSP), otherwise the iframe renders blank.
 * If `url` is empty, the modal shows a placeholder message instead.
 */
export function IframeModalButton({
  url,
  label,
  title,
  className,
  disabled = false,
}: {
  /** URL to load in the iframe. When empty, a placeholder is shown. */
  url?: string;
  /** Button text. */
  label: string;
  /** Modal header + iframe title (for accessibility). */
  title: string;
  /** Button styling. */
  className?: string;
  /** When true the button is inert (no modal) — e.g. report not ready. */
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (disabled) {
    return (
      <button type="button" disabled aria-disabled="true" className={className}>
        {label}
      </button>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex flex-col bg-surface"
        >
          <div className="flex items-center justify-between gap-4 border-b border-outline-variant bg-white px-4 py-3 sm:px-6">
            <p className="min-w-0 truncate font-headline text-lg text-on-surface">
              {title}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Close
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          {url ? (
            <iframe
              src={url}
              title={title}
              className="w-full flex-1 border-0"
              allow="camera; microphone; fullscreen; autoplay; clipboard-write"
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-on-surface-variant">
              This report isn’t available yet.
            </div>
          )}
        </div>
      )}
    </>
  );
}

/** Shared teal CTA styling for the primary modal trigger. */
export const PRIMARY_MODAL_BUTTON_CLASS =
  "inline-flex h-14 items-center justify-center rounded-full bg-primary px-6 font-body text-base font-bold text-on-primary whitespace-nowrap transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95 cursor-pointer";
