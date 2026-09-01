"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Button, Checkbox, FieldError, StepHeader } from "@pbh/ui";
import { copyFor, type Track } from "@pbh/copy";
import { StickyActions } from "./StickyActions";
import {
  CONSENT_REQUIRED_ERROR,
  type ConsentAction,
  type ConsentState,
} from "./types";

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
export function consentHeader(track: Track) {
  return {
    title: "Almost there!",
    subtitle: copyFor({ track }).phrase("consent.subtitle"),
  };
}

export function ConsentForm({
  action,
  track,
  onComplete,
  showHeader = true,
  terms,
}: {
  action: ConsentAction;
  /** Which product is being consented to — decides the wording. */
  track: Track;
  onComplete: () => void;
  showHeader?: boolean;
  /**
   * The agreement itself, rendered by the host — the marketing app passes the
   * CMS-authored terms through `TinaMarkdown`. Rendered rather than raw so this
   * package stays free of a CMS dependency and the funnel can render its own.
   *
   * Omitted (or absent from the CMS) falls back to the placeholder sections
   * below, so this step can never present an empty agreement.
   */
  terms?: ReactNode;
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

  const [agreed, setAgreed] = useState(false);

  // The submit button stays enabled even before the box is ticked (a disabled
  // button gives no feedback about *why* it can't be used). Clicking without
  // agreeing surfaces the error instead. Guarding here keeps that instant rather
  // than round-tripping to learn what we already know; `recordConsentCore`
  // re-checks regardless, so the client is never the only line of defence.
  const [agreeError, setAgreeError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (!agreed) {
      e.preventDefault();
      setAgreeError(CONSENT_REQUIRED_ERROR);
    }
  }

  function handleAgreedChange(checked: boolean) {
    setAgreed(checked);
    if (checked) {
      setAgreeError(null);
    }
  }

  // Same message whichever side produced it, so the two can't disagree.
  const agreedError = fieldErrors?.agreed ?? agreeError ?? undefined;

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex min-h-full flex-col items-center gap-8 bg-background-default"
    >
      {/* No hidden `userId`: whose consent this records is decided by the signed
          booking cookie, not by the submission. */}
      {showHeader ? <StepHeader {...consentHeader(track)} /> : null}

      {/* The fieldset wraps the terms; the action bar below is a sibling of it,
          not a child. A `fieldset` lays its children out in an anonymous box
          that does not stretch to the fieldset's own height, so an auto margin
          inside one can never reach the bottom edge. The form stretches, so the
          bar hangs off that — which also gives `sticky` the whole form to travel
          in — and carries the fieldset's `disabled` as explicit props. */}
      <fieldset
        disabled={pending}
        aria-busy={pending}
        className="m-0 flex w-full min-w-0 flex-col gap-8 border-0 p-0 transition-opacity disabled:opacity-60"
      >
        <div
          role="region"
          aria-label="Terms and conditions"
          tabIndex={0}
          className="h-[337px] w-full overflow-y-auto rounded-md border border-grey-warm-200 bg-grey-100 py-6 pl-6 pr-10 [scrollbar-color:var(--color-grey-400)_transparent] [scrollbar-width:thin] focus:outline-none focus:ring-1 focus:ring-brand-default [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-grey-400"
        >
          <div className="flex flex-col gap-6">
            {terms ?? (
              <>
                <p className="text-body-sm leading-normal text-grey-700">
                  {TERMS_INTRO}
                </p>

                {LEGAL_SECTIONS.map((section) => (
                  <div key={section.title} className="flex flex-col gap-2">
                    <p className="text-body-sm font-bold text-grey-900">
                      {section.title}
                    </p>
                    <p className="text-body-sm leading-normal text-grey-700">
                      {section.body}
                    </p>
                  </div>
                ))}

                <p className="text-[13px] italic text-grey-450">
                  {TERMS_UPDATED}
                </p>
              </>
            )}
          </div>
        </div>
      </fieldset>

      {/* The checkbox is pinned with the button, not just next to it: it gates
          the submit, so scrolling it out of view would leave a disabled button
          with no visible way to enable it. Only the terms scroll. */}
      <StickyActions className="flex w-full flex-col gap-8">
        <div>
          <label htmlFor="agreed" className="flex items-center gap-2">
            <Checkbox
              id="agreed"
              name="agreed"
              checked={agreed}
              onChange={(e) => handleAgreedChange(e.target.checked)}
              required
              disabled={pending}
              aria-required="true"
              aria-invalid={agreedError ? true : undefined}
              aria-describedby={agreedError ? "agreed-error" : undefined}
            />
            <span className="text-body text-ink-strong">
              I&rsquo;ve read and agree to the consent form.
            </span>
          </label>
          <FieldError id="agreed-error" message={agreedError} />
        </div>

        {state.status === "error" && !fieldErrors && (
          <p role="alert" className="animate-error-in text-body-sm text-error">
            {state.message}
          </p>
        )}

        <Button
          type="submit"
          color="primary"
          className="w-full"
          disabled={pending}
        >
          {pending ? "Saving…" : "Continue With Payment"}
        </Button>
      </StickyActions>
    </form>
  );
}
