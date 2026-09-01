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
  formatPhone,
} from "@pbh/ui";
import { StickyActions } from "./StickyActions";
import type { DetailsAction, DetailsState } from "./types";
import { EDUCATION_LEVELS, GENDER_OPTIONS } from "./field-options";

const initialState: DetailsState = { status: "idle" };

/**
 * Header copy for the details step (Figma 1642:3213), exported so a host that
 * renders the header itself — the booking modal pins it above the scroll area —
 * uses the same wording as the inline case.
 *
 * It no longer varies by who the booking is for: the assessment is taken by the
 * account holder, and the name fields below are theirs, prefilled from signup.
 */
export const DETAILS_HEADER = {
  title: "Welcome.",
  subtitle:
    "Please tell us about the person who’ll be taking the assessment. The assessment uses these details — like age and education — to give accurate, personalized results.",
} as const;

/**
 * What the details step already holds, for someone re-entering it. Exported so
 * the app's server action and this form agree on one shape — a `"use server"`
 * module can only export async functions, so the type cannot live beside the
 * action that returns it.
 */
export interface DetailsInitialValues {
  dateOfBirth?: string;
  zip?: string;
  phone?: string;
  gender?: string;
  educationLevel?: string;
}

export function DetailsForm({
  action,
  firstName,
  lastName,
  initialValues,
  onComplete,
  showHeader = true,
}: {
  action: DetailsAction;
  /** Account holder's name, from signup — prefilled into the fields below. */
  firstName: string;
  lastName: string;
  /**
   * What the row already holds, for someone re-entering this step to correct
   * something. Absent on a first pass, when there is nothing to prefill.
   *
   * The name pair stays a separate prop: it arrives from signup before any of
   * this exists, and is the one thing the step is known to have on a first pass.
   */
  initialValues?: DetailsInitialValues;
  onComplete: () => void;
  showHeader?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;

  const [phone, setPhone] = useState(initialValues?.phone ?? "");
  const [gender, setGender] = useState(initialValues?.gender ?? "");
  const [educationLevel, setEducationLevel] = useState(
    initialValues?.educationLevel ?? "",
  );

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
    <div className="flex min-h-full flex-col gap-8">
      {showHeader ? <StepHeader {...DETAILS_HEADER} /> : null}

      {/* No hidden `userId`: the action reads it from the signed booking
          cookie, so the form carries profile data only. */}
      {/* `flex flex-1 flex-col` here and on the fieldset carries the modal's
          height down to `StickyActions`, which parks itself on the bottom edge.
          Without the chain the bar has nothing to push against and rides up
          under the last field. */}
      <form action={formAction} noValidate className="flex flex-1 flex-col">
        <fieldset
          disabled={pending}
          aria-busy={pending}
          className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0 transition-opacity disabled:opacity-60"
        >
          {/* Leads the form because everything below describes this person:
              the account holder, prefilled from signup. */}
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
                aria-describedby={
                  fieldErrors?.firstName ? "firstName-error" : undefined
                }
                defaultValue={values?.firstName ?? firstName}
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
                aria-describedby={
                  fieldErrors?.lastName ? "lastName-error" : undefined
                }
                defaultValue={values?.lastName ?? lastName}
                className={fieldClass}
              />
              <FieldError id="lastName-error" message={fieldErrors?.lastName} />
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
                defaultValue={values?.dateOfBirth ?? initialValues?.dateOfBirth ?? ""}
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
                defaultValue={values?.zip ?? initialValues?.zip ?? ""}
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
            <p role="alert" className="animate-error-in text-body-sm text-error">
              {state.message}
            </p>
          )}
        </fieldset>

        {/* Outside the fieldset on purpose. A `fieldset` lays its children out
            in an anonymous box that does not stretch to the fieldset's own
            height, so an auto margin inside one can never reach the bottom
            edge — the bar would sit under the last field however tall the modal
            got. The form stretches, so the bar hangs off that instead, and
            takes the fieldset's `disabled` with it as an explicit prop. */}
        <StickyActions>
          <Button
            type="submit"
            color="primary"
            className="w-full"
            disabled={pending}
          >
            {pending ? "Saving…" : "Submit"}
          </Button>
        </StickyActions>
      </form>
    </div>
  );
}
