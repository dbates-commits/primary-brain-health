"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button, FieldError, StepHeader } from "@pbh/ui";
import { StickyActions } from "./StickyActions";
import type { ConsentAction, ConsentState } from "./types";

const initialState: ConsentState = { status: "idle" };

// Placeholder terms — real wellness + HIPAA NPP copy lands with the compliance
// task.
const TERMS_INTRO =
  'Please review the following terms and conditions carefully before using our platform. By clicking "Accept", you acknowledge that you have read and understood this entire agreement.';

const LEGAL_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service. These terms apply to all visitors, users and others who access or use the Service.",
  },
  {
    title: "2. Use of Service",
    body: "You agree not to use the Service for any purpose that is prohibited by these Terms. You are responsible for all of your activity in connection with the Service. Furthermore, you shall abide by all applicable local, state, national and international laws and regulations.",
  },
  {
    title: "3. Privacy Policy",
    body: "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and disclose information about you. By using the Service, you agree to our collection and use of personal data as outlined in the policy.",
  },
  {
    title: "4. Limitations of Liability",
    body: "In no event shall the Company, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.",
  },
  {
    title: "5. Governing Law",
    body: "These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the Company is headquartered, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.",
  },
];

const TERMS_UPDATED = "Last updated: October 24, 2023";

/**
 * Consent step, shared by the funnel and the marketing modal. The per-step
 * action is injected via `action`; submission is gated on the agreement
 * checkbox (`agreed`).
 */
/**
 * Header copy for the consent step, exported so a host that renders the header
 * itself (e.g. the marketing modal, which pins it above the scroll area) uses the
 * same title/subtitle as the inline funnel step.
 */
export const CONSENT_HEADER = {
  title: "Almost there!",
  subtitle:
    "Please, read carefully the following form to know what the terms of the assessments and consultation.",
} as const;

export function ConsentForm({
  action,
  userId,
  onComplete,
  showHeader = true,
}: {
  action: ConsentAction;
  userId: string;
  onComplete: () => void;
  showHeader?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  const advanced = useRef(false);
  useEffect(() => {
    if (state.status === "success" && !advanced.current) {
      advanced.current = true;
      onComplete();
    }
  }, [state, onComplete]);

  // Gate the submit button on the agreement checkbox alone.
  const [agreed, setAgreed] = useState(false);

  return (
    <form
      action={formAction}
      noValidate
      className="flex flex-col items-center gap-8 bg-surface"
    >
      <input type="hidden" name="userId" value={userId} />

      {showHeader ? <StepHeader {...CONSENT_HEADER} /> : null}

      {/* The terms live inside the fieldset so the fieldset spans the scrollable
          content. A `sticky` child can only travel within its containing block —
          were the action bar the fieldset's only child, the two would be the same
          height and it could never pin. */}
      <fieldset
        disabled={pending}
        aria-busy={pending}
        className="m-0 flex w-full min-w-0 flex-col gap-8 border-0 p-0 transition-opacity disabled:opacity-60"
      >
        <div
          role="region"
          aria-label="Terms and conditions"
          tabIndex={0}
          className="h-[337px] w-full overflow-y-auto rounded-md border border-outline-variant bg-surface-container py-6 pl-6 pr-10 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <div className="flex flex-col gap-6">
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {TERMS_INTRO}
            </p>

            {LEGAL_SECTIONS.map((section) => (
              <div key={section.title} className="flex flex-col gap-2">
                <p className="text-sm font-bold text-on-surface">
                  {section.title}
                </p>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {section.body}
                </p>
              </div>
            ))}

            <p className="text-[13px] italic text-on-surface-variant/70">
              {TERMS_UPDATED}
            </p>
          </div>
        </div>

        {/* The checkbox is pinned with the button, not just next to it: it gates
            the submit, so scrolling it out of view would leave a disabled button
            with no visible way to enable it. Only the terms scroll. */}
        <StickyActions className="flex flex-col gap-6">
          <div>
            <label htmlFor="agreed" className="flex items-center gap-2">
              <input
                id="agreed"
                type="checkbox"
                name="agreed"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
                aria-required="true"
                aria-invalid={fieldErrors?.agreed ? true : undefined}
                aria-describedby={
                  fieldErrors?.agreed ? "agreed-error" : undefined
                }
                className="size-6 shrink-0 rounded border-outline/60 text-primary focus:ring-primary"
              />
              <span className="text-lg text-on-surface">
                I have read and agree with consent form.
              </span>
            </label>
            <FieldError id="agreed-error" message={fieldErrors?.agreed} />
          </div>

          {state.status === "error" && !fieldErrors && (
            <p role="alert" className="animate-error-in text-sm text-error">
              {state.message}
            </p>
          )}

          <Button
            type="submit"
            color="primary"
            disabled={!agreed}
            className="h-14 w-full text-base"
          >
            {pending ? "Saving…" : "Continue With Payment"}
          </Button>
        </StickyActions>
      </fieldset>
    </form>
  );
}
