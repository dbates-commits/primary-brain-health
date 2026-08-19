import { EDUCATION_LEVEL_VALUES, GENDER_VALUES } from "@pbh/booking";

/**
 * The contract between the profile form, its server action and the Storybook
 * stubs. Deliberately neither `"use server"` nor `"server-only"` — all three
 * import it, which is what keeps field names and the dirty comparison from
 * drifting apart.
 */

/**
 * The seven fields the Profile Information card submits.
 *
 * `email` is absent on purpose. The account address is not editable here, and
 * leaving it out of the submitted shape is the type-level half of that: the
 * markup disables the input, and the server never looks for the key.
 */
export interface ProfileValues {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  zip: string;
  educationLevel: string;
}

/** What the card renders on first paint: the submittable seven, plus the locked email. */
export type ProfileInitialValues = ProfileValues & { email: string };

/**
 * Mirrors `DetailsState` in `@pbh/booking` with one deliberate difference:
 * **`success` carries the values.**
 *
 * `DetailsForm` unmounts on success — it advances a booking step — so it never
 * has to survive React 19's post-action `requestFormReset`. This card stays on
 * screen, and that reset restores every uncontrolled input to its current
 * `defaultValue`. Without the echo, a save would visibly snap the fields back to
 * what the database held before it. Do not "align" this with `DetailsState`.
 */
export type ProfileState =
  | { status: "idle" }
  | { status: "success"; values: ProfileValues }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string>;
      values: ProfileValues;
    };

export type ProfileAction = (
  prev: ProfileState,
  formData: FormData,
) => Promise<ProfileState>;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** Read the seven submitted fields. Never reads `email` — see {@link ProfileValues}. */
export function readProfileValues(formData: FormData): ProfileValues {
  return {
    firstName: text(formData, "firstName"),
    lastName: text(formData, "lastName"),
    phone: text(formData, "phone"),
    dateOfBirth: text(formData, "dateOfBirth"),
    gender: text(formData, "gender"),
    zip: text(formData, "zip"),
    educationLevel: text(formData, "educationLevel"),
  };
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Whether two snapshots are the same edit-wise — what drives the Save button.
 *
 * Phone compares by digits only: the form's change handler reads the DOM
 * mid-keystroke, before the formatter has re-applied the parentheses, so
 * comparing the formatted strings would report "edited" forever.
 */
export function sameProfileValues(a: ProfileValues, b: ProfileValues): boolean {
  return (
    a.firstName === b.firstName &&
    a.lastName === b.lastName &&
    a.dateOfBirth === b.dateOfBirth &&
    a.gender === b.gender &&
    a.zip === b.zip &&
    a.educationLevel === b.educationLevel &&
    phoneDigits(a.phone) === phoneDigits(b.phone)
  );
}

/**
 * Coerce a stored value to one of the canonical option values, or to `""`.
 *
 * `users.gender` and `users.education_level` can hold legacy human-readable
 * strings from the marketing intake form ("Male", "Bachelors (4 years)" — see
 * the note atop `field-options.ts`). A value that is not in the option list must
 * degrade to the disabled "Select" placeholder rather than being rendered as a
 * `<select>` value that does not exist.
 */
function normalizeOption(raw: string | null, allowed: Set<string>): string {
  if (raw && allowed.has(raw)) {
    return raw;
  }
  return "";
}

export function normalizeGender(raw: string | null): string {
  return normalizeOption(raw, GENDER_VALUES);
}

export function normalizeEducationLevel(raw: string | null): string {
  return normalizeOption(raw, EDUCATION_LEVEL_VALUES);
}
