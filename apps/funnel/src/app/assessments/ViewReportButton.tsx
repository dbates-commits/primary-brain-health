"use client";

import { useState } from "react";
import { getReportPdf } from "./actions";

/**
 * Downloads a subject's report PDF. The bytes are fetched on demand via the
 * `getReportPdf` server action and saved as a file with a descriptive name —
 * there is no server-rendered report route. Shows an inline message when the
 * report isn't ready yet or the fetch fails.
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
    try {
      const result = await getReportPdf(enrollmentId);
      if (result.status === "ready") {
        downloadBase64(result.dataBase64, result.filename, "application/pdf");
      } else if (result.status === "not_ready") {
        setMessage(
          "Your report is still being generated. Please check back soon.",
        );
      } else {
        setMessage(result.message);
      }
    } catch {
      setMessage(
        "Something went wrong downloading your report. Please try again.",
      );
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
        {pending ? "Preparing…" : "Download Report"}
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

/** Decode a base64 string and trigger a browser download of the given filename. */
function downloadBase64(base64: string, filename: string, type: string): void {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const url = URL.createObjectURL(new Blob([bytes], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Release the object URL once the download has been kicked off.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
