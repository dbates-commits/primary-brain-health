"use client";

import {
  useActionState,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Button,
  FieldError,
  Label,
  StepHeader,
  fieldClass,
} from "@pbh/ui";
import { StickyActions } from "./StickyActions";
import type { DetailsAction, DetailsState } from "./types";
import { US_STATES } from "./us-states";
import { EDUCATION_LEVELS, GENDER_OPTIONS } from "./field-options";

const initialState: DetailsState = { status: "idle" };

/** Format up to 10 digits as `(XXX) XXX-XXXX`, mirroring the intake form. */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);
  if (digits.length <= 3) {
    return area;
  }
  if (digits.length <= 6) {
    return `(${area}) ${prefix}`;
  }
  return `(${area}) ${prefix}-${line}`;
}

/**
 * Header copy for the details step, exported so a host that renders the header
 * itself (e.g. the marketing modal, which pins it above the scroll area) uses the
 * same title/subtitle as the inline funnel step.
 */
export function detailsHeader(name: string, isForSomeoneElse = false) {
  return {
    title: name ? `Welcome, ${name}` : "Welcome",
    // The subcopy carries the whole self/someone-else distinction. Every field
    // below asks about the person being assessed, so this one line is what tells
    // the buyer whose birthday and ZIP the form wants.
    subtitle: isForSomeoneElse
      ? "We need further information about the person receiving care. This all will help us interpret the results accurately."
      : "We need further information about yourself. This all will help us interpret the results accurately.",
  };
}

export function DetailsForm({
  action,
  userId,
  name,
  patientIdentification,
  onComplete,
  showHeader = true,
}: {
  action: DetailsAction;
  userId: string;
  name: string;
  /** "Self" | "Someone else", answered at signup. */
  patientIdentification: string;
  onComplete: () => void;
  showHeader?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;

  const isForSomeoneElse = patientIdentification === "Someone else";

  const [stateOfResidence, setStateOfResidence] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [educationLevel, setEducationLevel] = useState("");

  const stateRef = useRef<HTMLSelectElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const educationRef = useRef<HTMLSelectElement>(null);

  // React 19 auto-resets the <form> after a server action (requestFormReset),
  // which yanks controlled <select>s back to their first option and clears the
  // phone field. The controlled `value`s are unchanged across the error
  // re-render, so React doesn't re-assert them — we re-apply each from state
  // here, after the commit/reset, to keep the user's input.
  useLayoutEffect(() => {
    const fields: [{ current: HTMLInputElement | HTMLSelectElement | null }, string][] =
      [
        [stateRef, stateOfResidence],
        [phoneRef, phone],
        [genderRef, gender],
        [educationRef, educationLevel],
      ];
    for (const [ref, value] of fields) {
      const el = ref.current;
      if (el && el.value !== value) {
        el.value = value;
      }
    }

  });

  const advanced = useRef(false);
  useEffect(() => {
    if (state.status === "success" && !advanced.current) {
      advanced.current = true;
      onComplete();
    }
  }, [state, onComplete]);

  return (
    <div className="flex flex-col gap-8">
      {showHeader ? (
        <StepHeader {...detailsHeader(name, isForSomeoneElse)} />
      ) : null}

      <form action={formAction} noValidate>
        <input type="hidden" name="userId" value={userId} />

        <fieldset
          disabled={pending}
          aria-busy={pending}
          className="m-0 min-w-0 space-y-6 border-0 p-0 transition-opacity disabled:opacity-60"
        >
          {/* Only for someone-else bookings: the account holder is named at
              signup, so this row names the person actually being assessed. It
              leads the form because everything below describes that person. */}
          {isForSomeoneElse && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="patientFirstName">First name</Label>
                <input
                  id="patientFirstName"
                  name="patientFirstName"
                  type="text"
                  autoComplete="off"
                  placeholder="Jane"
                  required
                  aria-required="true"
                  aria-invalid={fieldErrors?.patientFirstName ? true : undefined}
                  aria-describedby={
                    fieldErrors?.patientFirstName
                      ? "patientFirstName-error"
                      : undefined
                  }
                  defaultValue={values?.patientFirstName ?? ""}
                  className={fieldClass}
                />
                <FieldError
                  id="patientFirstName-error"
                  message={fieldErrors?.patientFirstName}
                />
              </div>

              <div>
                <Label htmlFor="patientLastName">Last name</Label>
                <input
                  id="patientLastName"
                  name="patientLastName"
                  type="text"
                  autoComplete="off"
                  placeholder="Doe"
                  required
                  aria-required="true"
                  aria-invalid={fieldErrors?.patientLastName ? true : undefined}
                  aria-describedby={
                    fieldErrors?.patientLastName
                      ? "patientLastName-error"
                      : undefined
                  }
                  defaultValue={values?.patientLastName ?? ""}
                  className={fieldClass}
                />
                <FieldError
                  id="patientLastName-error"
                  message={fieldErrors?.patientLastName}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                autoComplete="bday"
                required
                aria-required="true"
                aria-invalid={fieldErrors?.dateOfBirth ? true : undefined}
                aria-describedby={
                  fieldErrors?.dateOfBirth ? "dateOfBirth-error" : undefined
                }
                defaultValue={values?.dateOfBirth ?? ""}
                className={fieldClass}
              />
              <FieldError
                id="dateOfBirth-error"
                message={fieldErrors?.dateOfBirth}
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                ref={genderRef}
                id="gender"
                name="gender"
                required
                aria-required="true"
                aria-invalid={fieldErrors?.gender ? true : undefined}
                aria-describedby={
                  fieldErrors?.gender ? "gender-error" : undefined
                }
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={fieldClass}
              >
                <option value="" disabled>
                  Select
                </option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <FieldError id="gender-error" message={fieldErrors?.gender} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="zip">ZIP code</Label>
              <input
                id="zip"
                name="zip"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                required
                aria-required="true"
                aria-invalid={fieldErrors?.zip ? true : undefined}
                aria-describedby={fieldErrors?.zip ? "zip-error" : undefined}
                defaultValue={values?.zip ?? ""}
                className={fieldClass}
              />
              <FieldError id="zip-error" message={fieldErrors?.zip} />
            </div>

            <div>
              <Label htmlFor="phone">Phone number</Label>
              <input
                ref={phoneRef}
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(555) 000-0000"
                required
                aria-required="true"
                aria-invalid={fieldErrors?.phone ? true : undefined}
                aria-describedby={fieldErrors?.phone ? "phone-error" : undefined}
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                className={fieldClass}
              />
              <FieldError id="phone-error" message={fieldErrors?.phone} />
            </div>
          </div>

          {/* State of residence is absent from the Figma frame, but the RFP
              requires it for the primary-care handoff and the intake gate's
              eligibility check, so it stays. Pairing it with education keeps the
              two-up rhythm instead of leaving a stray full-width row — the one
              deliberate layout divergence from the design. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="stateOfResidence">State of residence</Label>
              <select
                ref={stateRef}
                id="stateOfResidence"
                name="stateOfResidence"
                autoComplete="address-level1"
                required
                aria-required="true"
                aria-invalid={fieldErrors?.stateOfResidence ? true : undefined}
                aria-describedby={
                  fieldErrors?.stateOfResidence
                    ? "stateOfResidence-error"
                    : undefined
                }
                value={stateOfResidence}
                onChange={(e) => setStateOfResidence(e.target.value)}
                className={fieldClass}
              >
                <option value="" disabled>
                  Select a state
                </option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
              <FieldError
                id="stateOfResidence-error"
                message={fieldErrors?.stateOfResidence}
              />
            </div>

            <div>
              <Label htmlFor="educationLevel">Highest level of education</Label>
              <select
                ref={educationRef}
                id="educationLevel"
                name="educationLevel"
                required
                aria-required="true"
                aria-invalid={fieldErrors?.educationLevel ? true : undefined}
                aria-describedby={
                  fieldErrors?.educationLevel
                    ? "educationLevel-error"
                    : undefined
                }
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className={fieldClass}
              >
                <option value="" disabled>
                  Select
                </option>
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              <FieldError
                id="educationLevel-error"
                message={fieldErrors?.educationLevel}
              />
            </div>
          </div>

          {state.status === "error" && !fieldErrors && (
            <p role="alert" className="animate-error-in text-sm text-error">
              {state.message}
            </p>
          )}

          <StickyActions>
            <Button
              type="submit"
              color="primary"
              className="h-14 w-full text-base"
            >
              {pending ? "Saving…" : "Submit"}
            </Button>
          </StickyActions>
        </fieldset>
      </form>
    </div>
  );
}
