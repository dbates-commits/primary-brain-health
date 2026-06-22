"use client";

import {
  useActionState,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@pbh/ui";
import { completeProfile, type DetailsState } from "./actions";
import { FieldError } from "@/components/FieldError";
import { Label } from "@/components/Label";
import { StepHeader } from "@/components/StepHeader";
import { fieldClass } from "@/components/form-constants";
import { US_STATES } from "./us-states";

const initialState: DetailsState = { status: "idle" };

export function DetailsForm({
  userId,
  name,
  onComplete,
}: {
  userId: string;
  name: string;
  onComplete: () => void;
}) {
  const [state, action, pending] = useActionState(completeProfile, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;

  const [stateOfResidence, setStateOfResidence] = useState("");
  const selectRef = useRef<HTMLSelectElement>(null);

  // React 19 auto-resets the <form> after a server action (requestFormReset),
  // which yanks this <select> back to its first option (Alabama, since the
  // placeholder is disabled). The controlled `value` is unchanged across the
  // error re-render, so React doesn't re-assert it — we re-apply it from state
  // here, after the commit/reset, to keep the user's selection.
  useLayoutEffect(() => {
    const el = selectRef.current;
    if (el && el.value !== stateOfResidence) {
      el.value = stateOfResidence;
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
      <StepHeader
        title={name ? `Welcome, ${name}!` : "Welcome!"}
        subtitle="We still need some extra information to proceed with your assessment. Please complete this form."
      />

      <form action={action} noValidate>
        <input type="hidden" name="userId" value={userId} />

        <fieldset
          disabled={pending}
          aria-busy={pending}
          className="m-0 min-w-0 space-y-6 border-0 p-0 transition-opacity disabled:opacity-60"
        >
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
              <Label htmlFor="stateOfResidence">State of residence</Label>
              <select
                ref={selectRef}
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
          </div>

          {state.status === "error" && !fieldErrors && (
            <p role="alert" className="animate-error-in text-sm text-error">
              {state.message}
            </p>
          )}

          <Button type="submit" color="primary" className="h-14 w-full text-base">
            {pending ? "Saving…" : "Submit"}
          </Button>
        </fieldset>
      </form>
    </div>
  );
}
