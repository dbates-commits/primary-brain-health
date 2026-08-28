"use client";

import { useActionState, useEffect, useLayoutEffect, useRef, useState } from "react";
import { EDUCATION_LEVELS, GENDER_OPTIONS } from "@pbh/booking";
import { Button, FieldError, Label, Select, Toast, fieldClass, formatPhone } from "@pbh/ui";
import {
  readProfileValues,
  sameProfileValues,
  type ProfileAction,
  type ProfileInitialValues,
  type ProfileState,
  type ProfileValues,
} from "@/lib/profile-values";

const initialState: ProfileState = { status: "idle" };

/**
 * How long the confirmation toast stays up: long enough to read, short enough
 * that it is gone before the customer looks back at the header it covers.
 */
const TOAST_MS = 4000;

/** Must match `.animate-toast-out` in `globals.css` — see the effect below. */
const TOAST_EXIT_MS = 200;

/**
 * The Profile Information form (Figma 2092:13144).
 *
 * The action is injected rather than imported so Storybook can render this with
 * a stub — the same seam `DetailsForm` uses, and the reason `.storybook/main.ts`
 * needs no alias for it.
 *
 * Figma's newsletter checkbox and its extra rule are deliberately absent.
 */
export function ProfileForm({
  action,
  initial,
  onSaved,
}: {
  action: ProfileAction;
  initial: ProfileInitialValues;
  /**
   * Fired once per successful save. `ProfileFormWithSession` uses it to
   * refresh the Auth.js session, since the header greets the customer by the
   * name this form just changed. Injected rather than reached for here for the
   * same reason `action` is: it keeps `useSession` — and the provider it
   * requires — out of the component the stories render.
   */
  onSaved?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "idle" ? undefined : state.values;

  // Through the formatter, not raw: a row written before `formatPhone` existed
  // (or by the marketing intake form) holds bare digits, and seeding those
  // would both render unformatted and re-save the old format on the next edit.
  const [phone, setPhone] = useState(formatPhone(initial.phone));
  const [gender, setGender] = useState(initial.gender);
  const [educationLevel, setEducationLevel] = useState(initial.educationLevel);

  const phoneRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const educationRef = useRef<HTMLSelectElement>(null);

  /**
   * Save is inert until something is actually different — Figma draws it
   * `brand/muted` in that state (2092:13168).
   *
   * One delegated handler rather than seven `onChange`s: React's synthetic
   * `onChange` is `input` for text fields and `change` for `<select>`, and both
   * bubble to the form, so the selects and the date input are covered for free.
   * It reads the DOM, so controlled and uncontrolled fields report identically,
   * and the disabled email is excluded by the same native rule that keeps it
   * out of the submission.
   *
   * `dirty` *compares* rather than latching a flag, so typing a character and
   * deleting it returns the button to pristine, and a successful save clears it
   * without an effect: the saved values become `persisted` and the last
   * snapshot already equals them.
   *
   * `persisted` is what the database last accepted, carried in state rather
   * than read off the current action result — that result is an error after a
   * failed save, and falling back to `initial` there would strand an earlier
   * save. (Save "Dave", fail a second save, retype "David": comparing against
   * `initial` says pristine and disables Save while the row still holds
   * "Dave".) A failed save simply leaves it where it was, which is exactly the
   * "nothing was written, keep Save live for a retry" behaviour.
   */
  const [snapshot, setSnapshot] = useState<ProfileValues | null>(null);
  const [persisted, setPersisted] = useState<ProfileValues>(initial);
  const dirty = snapshot !== null && !sameProfileValues(snapshot, persisted);

  function handleChange(event: React.ChangeEvent<HTMLFormElement>) {
    setSnapshot(readProfileValues(new FormData(event.currentTarget)));
  }

  /**
   * The confirmation toast (Figma 2092:13191): in, a hold, then out.
   *
   * Three pieces of state, and they are not interchangeable. `shown` is the
   * save the toast belongs to and is **never cleared** — it is what makes this
   * fire once per save. Clearing it on hide would leave the render-time
   * condition below true again on the very next render (`state` is still that
   * same success object, `shown` is now empty), re-latching in a loop that puts
   * the toast back on screen every few seconds for as long as the page is open.
   * `visible` and `leaving` carry the phases instead: a component cannot
   * animate its own unmount, so `leaving` is the phase where the toast is still
   * mounted but on its way off.
   *
   * It latches the success *object*, not `status`: `useActionState` hands back
   * a fresh one per submit, so saving twice restarts the sequence from the top
   * instead of letting the first toast expire on the second save's watch. The
   * latch is set during render — the supported way to react to changed input —
   * rather than in an effect, which would cost a second render pass.
   *
   * The hide is a timer, not `onAnimationEnd`: under `prefers-reduced-motion`
   * the animation is `none` and that event never fires, which would leave the
   * toast up forever.
   */
  const [shown, setShown] = useState<ProfileState | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastLeaving, setToastLeaving] = useState(false);

  if (state.status === "success" && state !== shown) {
    setShown(state);
    setPersisted(state.values);
    setToastVisible(true);
    setToastLeaving(false);
  }

  // Through a ref so an inline `onSaved` — a new function identity every render
  // — cannot make the effect below re-fire and re-request the session in a loop.
  // Kept current in its own effect, which runs before that one.
  const onSavedRef = useRef(onSaved);
  useEffect(() => {
    onSavedRef.current = onSaved;
  });

  useEffect(() => {
    if (shown === null) {
      return;
    }
    onSavedRef.current?.();
    const leave = setTimeout(() => setToastLeaving(true), TOAST_MS);
    const hide = setTimeout(() => setToastVisible(false), TOAST_MS + TOAST_EXIT_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(hide);
    };
  }, [shown]);

  // React 19 auto-resets the <form> after a server action (requestFormReset).
  // `form.reset()` restores each option's `selected` *attribute* while React
  // sets the *property*, so a reset yanks both <select>s back to their first
  // option and clears the phone field, whichever value is selected. The
  // controlled values are unchanged across the re-render, so React doesn't
  // re-assert them — re-apply each here, after the commit. Same fix as
  // `DetailsForm`, verified in-browser there.
  useLayoutEffect(() => {
    const fields: [
      { current: HTMLInputElement | HTMLSelectElement | null },
      string,
    ][] = [
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

  return (
    <form action={formAction} noValidate onChange={handleChange} className="mt-6">
      <fieldset
        disabled={pending}
        aria-busy={pending}
        className="m-0 min-w-0 space-y-6 border-0 p-0 transition-opacity disabled:opacity-60"
      >
        {/* Figma's four rows of two, as eight cells in one grid — 20px gaps
            both ways, collapsing to a single column below `sm`. */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
              defaultValue={values?.firstName ?? initial.firstName}
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
              defaultValue={values?.lastName ?? initial.lastName}
              className={fieldClass}
            />
            <FieldError id="lastName-error" message={fieldErrors?.lastName} />
          </div>

          {/* The account address is not editable here. Two independent reasons
              it can never be submitted: `disabled` (browsers exclude disabled
              controls from FormData) and no `name` at all. The dimmed label is
              the Figma Disabled variant's label colour; its tan fill is not
              applied — see the note in the PR. */}
          <div>
            <Label htmlFor="email" className="text-text-secondary">
              Email
            </Label>
            <input
              id="email"
              type="email"
              disabled
              defaultValue={initial.email}
              className={fieldClass}
            />
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

          {/* Figma labels this "Year of Birth". We render the booking details
              step's field instead: `users.date_of_birth` is a full date that
              Linus needs as a `birthDate`, so a year-only control would have to
              fabricate a month and day or read-modify-write around the existing
              value on every save. */}
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              autoComplete="bday"
              required
              aria-required="true"
              aria-invalid={fieldErrors?.dateOfBirth ? true : undefined}
              aria-describedby={fieldErrors?.dateOfBirth ? "dateOfBirth-error" : undefined}
              defaultValue={values?.dateOfBirth ?? initial.dateOfBirth}
              className={fieldClass}
            />
            <FieldError id="dateOfBirth-error" message={fieldErrors?.dateOfBirth} />
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
              aria-describedby={fieldErrors?.gender ? "gender-error" : undefined}
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
              defaultValue={values?.zip ?? initial.zip}
              className={fieldClass}
            />
            <FieldError id="zip-error" message={fieldErrors?.zip} />
          </div>

          <div>
            <Label htmlFor="educationLevel">Highest Level of Education</Label>
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
                Select
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
        </div>

        <hr className="border-t border-border-subtle" />

        {state.status === "error" && !fieldErrors && (
          <p role="alert" className="animate-error-in text-body-sm text-error">
            {state.message}
          </p>
        )}

        <Button
          type="submit"
          color="primary"
          disabled={pending || !dirty}
          // Figma draws the pristine button `brand/muted` — pale but fully
          // opaque, not the 50% wash `Button` gives every other disabled
          // button. `cn` is tailwind-merge and `className` lands last, so both
          // overrides win while `cursor-not-allowed` survives. Left off while
          // pending, so an in-flight save keeps the standard wash and the two
          // states stay distinct.
          className={dirty ? undefined : "bg-brand-muted opacity-100 hover:brightness-100"}
        >
          {pending ? "Saving…" : "Save Changes"}
        </Button>
      </fieldset>

      {/* Figma pins the toast to the top of the page, centred, 28px down
          (2092:13191) — which puts it over the fixed header, hence a z-index
          above the header's `z-50`. `pointer-events-none` so it can never
          swallow a click meant for the nav underneath. It sits inside the form
          only because that is this component's root; `fixed` takes it out of
          the flow either way. */}
      {toastVisible && (
        <div className="pointer-events-none fixed inset-x-0 top-7 z-[60] flex justify-center px-4">
          <Toast message="Changes saved successfully" leaving={toastLeaving} />
        </div>
      )}
    </form>
  );
}
