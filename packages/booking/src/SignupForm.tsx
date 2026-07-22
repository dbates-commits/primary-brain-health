"use client";

import { useActionState, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Button,
  FieldError,
  Label,
  SegmentedControl,
  StepHeader,
  fieldClass,
  labelClass,
} from "@pbh/ui";
import { PATIENT_IDENTIFICATION_OPTIONS } from "./field-options";
import { StickyActions } from "./StickyActions";
import type { SignupAction, SignupResult, SignupState } from "./types";

const initialState: SignupState = { status: "idle" };

/**
 * Default step copy, exported so a host rendering the header outside the form
 * (the booking modal renders headers in a fixed region above the scroll area)
 * can use the same wording as the inline case.
 */
export const SIGNUP_HEADER = {
  title: "Welcome.",
  subtitle: "We’ll happily help you in taking control of your brain health.",
} as const;

/**
 * First/last/email account form. The per-step action is injected via `action`,
 * so the same component serves the funnel (its `createAccount`) and the marketing
 * modal. `showHeader`/`title`/`subtitle`/`submitLabel` let the host render it
 * with its own header treatment and CTA copy.
 */
export function SignupForm({
  action,
  onComplete,
  showHeader = true,
  title = SIGNUP_HEADER.title,
  subtitle = SIGNUP_HEADER.subtitle,
  submitLabel = "Continue",
}: {
  action: SignupAction;
  onComplete: (result: SignupResult) => void;
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;

  // Defaults to "Self": every design renders one pill selected, and a segmented
  // control has no empty-state affordance, so leaving it unset reads as broken
  // rather than as a question awaiting an answer.
  const [patientIdentification, setPatientIdentification] = useState(
    values?.patientIdentification || "Self",
  );
  const patientGroupRef = useRef<HTMLDivElement>(null);
  const isForSomeoneElse = patientIdentification === "Someone else";

  // React 19 auto-resets the <form> after a server action (requestFormReset),
  // which clears the radio group. The controlled value is unchanged across the
  // error re-render, so React won't re-assert it — restore `checked` from state
  // here, after the commit/reset, to keep the user's answer.
  useLayoutEffect(() => {
    const group = patientGroupRef.current;
    if (!group) {
      return;
    }
    const radios = group.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    for (const radio of radios) {
      const shouldBeChecked = radio.value === patientIdentification;
      if (radio.checked !== shouldBeChecked) {
        radio.checked = shouldBeChecked;
      }
    }
  });

  // Advance the flow once the account exists. Guard against re-firing if this
  // component re-renders while still on the success state.
  const advanced = useRef(false);
  useEffect(() => {
    if (state.status === "success" && !advanced.current) {
      advanced.current = true;
      onComplete({
        userId: state.userId,
        email: state.email,
        firstName: state.firstName,
        lastName: state.lastName,
        patientIdentification: state.patientIdentification,
      });
    }
  }, [state, onComplete]);

  return (
    <div className="flex flex-col gap-8">
      {showHeader ? <StepHeader title={title} subtitle={subtitle} /> : null}

      <form action={formAction} noValidate>
        <fieldset
          disabled={pending}
          aria-busy={pending}
          className="m-0 min-w-0 space-y-8 border-0 p-0 transition-opacity disabled:opacity-60"
        >
          {/* Every group in this step is 32px apart (Figma 1181:1719) — the
              card's own gap. The 16px and 8px gaps live *inside* a group: 16px
              between the two name columns, 8px between a label and its input. */}
          {/* Asked before the name fields because it decides whose details the
              next step collects — and therefore how that step is worded. */}
          <div>
            <span className={labelClass}>Who is this consultation for?</span>
            <div ref={patientGroupRef} className="mt-2">
              <SegmentedControl
                name="patientIdentification"
                aria-label="Who is this consultation for?"
                options={[...PATIENT_IDENTIFICATION_OPTIONS]}
                value={patientIdentification}
                onChange={(e) => setPatientIdentification(e.target.value)}
              />
            </div>
            <FieldError
              id="patientIdentification-error"
              message={fieldErrors?.patientIdentification}
            />
          </div>

          {/* Booking for someone else still collects the *buyer's* details here
              — the account holder is who we verify and email. Saying so avoids
              them entering the care recipient's name, which the next step asks
              for separately (Figma 1181:1938). */}
          {isForSomeoneElse && <p className={labelClass}>Please enter your personal information</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                aria-required="true"
                aria-invalid={fieldErrors?.firstName ? true : undefined}
                aria-describedby={fieldErrors?.firstName ? "firstName-error" : undefined}
                defaultValue={values?.firstName ?? ""}
                className={fieldClass}
              />
              <FieldError id="firstName-error" message={fieldErrors?.firstName} />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                aria-required="true"
                aria-invalid={fieldErrors?.lastName ? true : undefined}
                aria-describedby={fieldErrors?.lastName ? "lastName-error" : undefined}
                defaultValue={values?.lastName ?? ""}
                className={fieldClass}
              />
              <FieldError id="lastName-error" message={fieldErrors?.lastName} />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={fieldErrors?.email ? true : undefined}
              aria-describedby={fieldErrors?.email ? "email-error" : undefined}
              defaultValue={values?.email ?? ""}
              className={fieldClass}
            />
            <FieldError id="email-error" message={fieldErrors?.email} />
          </div>

          {state.status === "error" && !fieldErrors && (
            <p role="alert" className="animate-error-in text-sm text-error">
              {state.message}
            </p>
          )}

          <StickyActions>
            <Button type="submit" color="primary" className="h-14 w-full text-base">
              {pending ? "Creating account…" : submitLabel}
            </Button>
          </StickyActions>
        </fieldset>
      </form>
    </div>
  );
}
