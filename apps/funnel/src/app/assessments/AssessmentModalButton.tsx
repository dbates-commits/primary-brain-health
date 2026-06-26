"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Start Assessment" CTA that opens the assessment in a full-screen modal
 * iframe instead of a new tab. Handles Escape-to-close, body scroll lock, and
 * focusing the close button on open.
 *
 * Note: the assessment must permit being framed (no `X-Frame-Options: DENY` /
 * restrictive `frame-ancestors` CSP), otherwise the iframe renders blank — in
 * that case fall back to opening `redirect` in a new tab.
 */
export function AssessmentModalButton({
  redirect,
  name,
}: {
  redirect: string;
  name: string;
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-6 font-body text-base font-bold text-on-primary whitespace-nowrap transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-95"
      >
        Start Assessment
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={name}
          className="fixed inset-0 z-50 flex flex-col bg-surface"
        >
          <div className="flex items-center justify-between gap-4 border-b border-outline-variant bg-white px-4 py-3 sm:px-6">
            <p className="min-w-0 truncate font-headline text-lg text-on-surface">
              {name}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assessment"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Close
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          <iframe
            src={redirect}
            title={name}
            className="w-full flex-1 border-0"
            allow="camera; microphone; fullscreen; autoplay; clipboard-write"
          />
        </div>
      )}
    </>
  );
}
