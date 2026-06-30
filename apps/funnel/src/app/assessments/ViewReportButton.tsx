"use client";

import { useState } from "react";
import { getReportPdf } from "./actions";

/**
 * Opens a subject's report PDF in a new tab. The bytes are fetched on demand via
 * the `getReportPdf` server action and turned into a same-origin blob URL — there
 * is no server-rendered report route. To dodge the popup blocker we open the tab
 * synchronously inside the click handler, then navigate it once the PDF arrives.
 */
export function ViewReportButton({
  enrollmentId,
  className,
}: {
  enrollmentId: string;
  className?: string;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setMessage(null);
    setPending(true);
    // Open the blank tab now, while we still have the user gesture, so the
    // browser doesn't block it during the async fetch below.
    const tab = window.open("", "_blank");
    try {
      const result = await getReportPdf(enrollmentId);
      if (result.status === "ready") {
        const url = blobUrlFromBase64(result.dataBase64, "application/pdf");
        if (tab) {
          tab.location.href = url;
        } else {
          // Popup blocked — fall back to navigating the current tab.
          window.location.href = url;
        }
        // Release the object URL once the tab has had time to load it.
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else if (result.status === "not_ready") {
        tab?.close();
        setMessage(
          "Your report is still being generated. Please check back soon.",
        );
      } else {
        tab?.close();
        setMessage(result.message);
      }
    } catch {
      tab?.close();
      setMessage("Something went wrong opening your report. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={className}
      >
        {pending ? "Opening…" : "View Report"}
      </button>
      {message && (
        <p
          role="alert"
          className="max-w-[14rem] text-center text-sm text-on-surface-variant"
        >
          {message}
        </p>
      )}
    </div>
  );
}

/** Decode a base64 string into a same-origin blob URL of the given MIME type. */
function blobUrlFromBase64(base64: string, type: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return URL.createObjectURL(new Blob([bytes], { type }));
}
