"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  Button,
  FieldError,
  Label,
  StepHeader,
  fieldClass,
} from "@pbh/ui";
import { StickyActions } from "./StickyActions";
import type { SignupAction, SignupResult, SignupState } from "./types";

const initialState: SignupState = { status: "idle" };

/**
 * Default step copy, exported so a host rendering the header outside the form
 * can use the same wording as the inline case.
 */
export const SIGNUP_HEADER = {
  title: "Welcome.",
  subtitle: "We’ll happily help you in taking control of your brain health.",
} as const;

/**
 * First/last/email account form — the entry point to the whole booking flow.
 * The per-step action is injected via `action`, so the component stays
 * host-agnostic (the page passes its real `"use server"` action; Storybook
 * passes a stub).
 *
 * It no longer asks who the assessment is for. The details step collects the
 * patient's name instead, prefilled from what is entered here, so the common
 * case (booking for yourself) answers the question by saying nothing.
 */
export function SignupForm({
  action,
  onComplete,
  showHeader = true,
  title = SIGNUP_HEADER.title,
  subtitle = SIGNUP_HEADER.subtitle,
  submitLabel = "Continue",
  submitLabelShort,
  submitColor = "primary",
  sticky = true,
}: {
  action: SignupAction;
  onComplete: (result: SignupResult) => void;
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  /** Shown below `sm` when the full label is too long for a narrow button. */
  submitLabelShort?: string;
  /**
   * Submit fill. Primary in the modal, where it sits on the warm surface; the
   * on-page card wants white, which is what the design specifies against that
   * card's own white background — the shadow is what separates them.
   */
  submitColor?: "primary" | "white";
  /**
   * Pins the submit button to the bottom of a scrolling container. Right in the
   * modal; wrong on the page, where the form sits in a card that doesn't scroll
   * and the bar would stick to the viewport instead.
   */
  sticky?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;

  // Advance the flow once the account exists. Guard against re-firing if this
  // component re-renders while still on the success state.
  const advanced = useRef(false);
  useEffect(() => {
    if (state.status === "success" && !advanced.current) {
      advanced.current = true;
      onComplete({
        email: state.email,
        firstName: state.firstName,
        lastName: state.lastName,
      });
    }
  }, [state, onComplete]);

  const submit = (
    <Button
      type="submit"
      color={submitColor}
      className={
        submitColor === "white"
          ? "w-full shadow-[0_8px_12px_rgba(0,0,0,0.12)]"
          : "w-full"
      }
    >
      {pending ? (
        "Creating account…"
      ) : submitLabelShort ? (
        <>
          <span className="sm:hidden">{submitLabelShort}</span>
          <span className="hidden sm:inline">{submitLabel}</span>
        </>
      ) : (
        submitLabel
      )}
    </Button>
  );

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

          {sticky ? <StickyActions>{submit}</StickyActions> : submit}
        </fieldset>
      </form>
    </div>
  );
}
