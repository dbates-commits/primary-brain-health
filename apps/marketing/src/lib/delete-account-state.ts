/**
 * The contract between the Delete Account modal, its server action and the
 * Storybook mocks that stand in for it.
 *
 * Deliberately neither `"use server"` nor `"server-only"`: the same reason
 * `profile-values.ts` isn't either. A client component, a server action and a
 * story fixture all have to agree on this shape, so it cannot live in a module
 * only one of them is allowed to import.
 */

/**
 * The confirmation checkbox's field name. The action re-checks it server-side —
 * the disabled button is a courtesy to the person using the page, not a control
 * against a hand-rolled POST.
 */
export const CONFIRM_FIELD = "confirm";

/**
 * Unlike `ProfileState`, `success` carries nothing back. The profile card stays
 * on screen and has to echo its saved values; this modal is a one-shot — on
 * success the whole document is replaced by the sign-out navigation, so there is
 * no surviving UI to hand anything to.
 */
export type DeleteAccountState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export type DeleteAccountAction = (
  prev: DeleteAccountState,
  formData: FormData,
) => Promise<DeleteAccountState>;
