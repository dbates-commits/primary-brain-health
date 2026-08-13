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
  Select,
  StepHeader,
  fieldClass,
} from "@pbh/ui";
import { StickyActions } from "./StickyActions";
import type { DetailsAction, DetailsState } from "./types";
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
 * Header copy for the details step (Figma 1642:3213), exported so a host that
 * renders the header itself — the booking modal pins it above the scroll area —
 * uses the same wording as the inline case.
 *
 * It no longer varies by who the booking is for. The name fields below carry
 * that distinction now: they arrive prefilled with the account holder's name,
 * and someone booking for a parent or spouse simply types over them.
 */
export const DETAILS_HEADER = {
  title: "Welcome.",
  subtitle:
    "Please tell us about the person who’ll be taking the assessment. The assessment uses these details — like age and education — to give accurate, personalized results.",
} as const;

export function DetailsForm({
  action,
  firstName,
  lastName,
  onComplete,
  showHeader = true,
}: {
  action: DetailsAction;
  /** Account holder's name, prefilled as the patient's — see DETAILS_HEADER. */
  firstName: string;
  lastName: string;
  onComplete: () => void;
  showHeader?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;

  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [educationLevel, setEducationLevel] = useState("");

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
      {showHeader ? <StepHeader {...DETAILS_HEADER} /> : null}

      {/* No hidden `userId`: the action reads it from the signed booking
          cookie, so the form carries profile data only. */}
      <form action={formAction} noValidate>
        <fieldset
          disabled={pending}
          aria-busy={pending}
          className="m-0 min-w-0 space-y-6 border-0 p-0 transition-opacity disabled:opacity-60"
        >
          {/* Leads the form because everything below describes this person.
              Prefilled from the account, so booking for yourself is a no-op and
              booking for someone else is an edit rather than a question. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="patientFirstName">First Name</Label>
              <input
                id="patientFirstName"
                name="patientFirstName"
                type="text"
                autoComplete="off"
                required
                aria-required="true"
                aria-invalid={fieldErrors?.patientFirstName ? true : undefined}
                aria-describedby={
                  fieldErrors?.patientFirstName
                    ? "patientFirstName-error"
                    : undefined
                }
                defaultValue={values?.patientFirstName ?? firstName}
                className={fieldClass}
              />
              <FieldError
                id="patientFirstName-error"
                message={fieldErrors?.patientFirstName}
              />
            </div>

            <div>
              <Label htmlFor="patientLastName">Last Name</Label>
              <input
                id="patientLastName"
                name="patientLastName"
                type="text"
                autoComplete="off"
                required
                aria-required="true"
                aria-invalid={fieldErrors?.patientLastName ? true : undefined}
                aria-describedby={
                  fieldErrors?.patientLastName
                    ? "patientLastName-error"
                    : undefined
                }
                defaultValue={values?.patientLastName ?? lastName}
                className={fieldClass}
              />
              <FieldError
                id="patientLastName-error"
                message={fieldErrors?.patientLastName}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="dateOfBirth">Birthday</Label>
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
              <Select
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
              >
                <option value="" disabled>
                  Select
                </option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </Select>
              <FieldError id="gender-error" message={fieldErrors?.gender} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="zip">ZIP Code</Label>
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
              <Label htmlFor="phone">Phone Number</Label>
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

          <div>
            <Label htmlFor="educationLevel">Highest Level of education</Label>
            <Select
              ref={educationRef}
              id="educationLevel"
              name="educationLevel"
              required
              aria-required="true"
              aria-invalid={fieldErrors?.educationLevel ? true : undefined}
              aria-describedby={
                fieldErrors?.educationLevel ? "educationLevel-error" : undefined
              }
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
            >
              <option value="" disabled>
                Select an option
              </option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </Select>
            <FieldError
              id="educationLevel-error"
              message={fieldErrors?.educationLevel}
            />
          </div>

          {state.status === "error" && !fieldErrors && (
            <p role="alert" className="animate-error-in text-sm text-error">
              {state.message}
            </p>
          )}

          <StickyActions>
            <Button type="submit" color="primary" className="w-full">
              {pending ? "Saving…" : "Submit"}
            </Button>
          </StickyActions>
        </fieldset>
      </form>
    </div>
  );
}
