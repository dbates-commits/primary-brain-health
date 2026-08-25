"use server";

import { auth } from "@/auth";
import { deactivateAccountCore } from "@/lib/deactivate-account-core";
import {
  CONFIRM_FIELD,
  type DeleteAccountState,
} from "@/lib/delete-account-state";
import { saveProfileCore } from "@/lib/profile-core";
import { readProfileValues, type ProfileState } from "@/lib/profile-values";

/**
 * Save the Profile Information card.
 *
 * Identity comes from the Auth.js session, never from the form — the same rule
 * the booking actions follow with `resolveBookingUserId`, and the reason no
 * hidden `userId` appears anywhere in the markup.
 */
export async function saveProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      status: "error",
      message: "Your session has expired. Please sign in again.",
      values: readProfileValues(formData),
    };
  }

  return saveProfileCore(userId, formData);
}

/**
 * File a deletion request from the Delete Account card.
 *
 * Same rule as above: identity from the session, never from the form. The
 * confirmation checkbox is re-checked here as well as being drawn — the
 * disabled button is a courtesy to the person using the page, not a control
 * against a hand-rolled POST.
 */
export async function deleteAccountAction(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      status: "error",
      message: "Your session has expired. Please sign in again.",
    };
  }

  // An unchecked box submits nothing at all; a checked one submits "on".
  if (formData.get(CONFIRM_FIELD) !== "on") {
    return {
      status: "error",
      message: "Please confirm you understand this can't be undone.",
    };
  }

  return deactivateAccountCore(userId);
}
