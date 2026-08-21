"use server";

import { auth } from "@/auth";
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
