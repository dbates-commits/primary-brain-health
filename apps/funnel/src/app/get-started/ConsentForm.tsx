"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@pbh/ui";
import { recordConsent, type ConsentState } from "./consent-actions";
import { FieldError, labelClass } from "./form-styles";

const initialState: ConsentState = { status: "idle" };

// Placeholder terms — real wellness + HIPAA NPP copy lands with the compliance
// task.
const PLACEHOLDER_TERMS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
];

export function ConsentForm({
  userId,
  onComplete,
}: {
  userId: string;
  onComplete: () => void;
}) {
  const [state, action, pending] = useActionState(recordConsent, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  const advanced = useRef(false);
  useEffect(() => {
    if (state.status === "success" && !advanced.current) {
      advanced.current = true;
      onComplete();
    }
  }, [state, onComplete]);

  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      <input type="hidden" name="userId" value={userId} />

      <div className="max-h-72 space-y-4 overflow-y-auto rounded-xl border border-outline/40 bg-surface p-5 text-sm text-on-surface-variant">
        <p className="font-headline text-base text-primary">
          Wellness &amp; privacy terms
        </p>
        {PLACEHOLDER_TERMS.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div>
        <label className={`${labelClass} flex items-start gap-3 font-normal`}>
          <input
            type="checkbox"
            name="agreed"
            className="mt-1 size-4 shrink-0 rounded border-outline/60 text-primary focus:ring-primary"
          />
          <span>
            I have read and agree to the wellness terms and the HIPAA Notice of
            Privacy Practices.
          </span>
        </label>
        <FieldError message={fieldErrors?.agreed} />
      </div>

      {state.status === "error" && !fieldErrors && (
        <p className="text-sm text-error">{state.message}</p>
      )}

      <Button type="submit" color="primary" className="w-full">
        {pending ? "Saving…" : "Agree and continue"}
      </Button>
    </form>
  );
}
