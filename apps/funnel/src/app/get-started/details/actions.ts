"use server";

import {
  completeProfileCore,
  resolveBookingUserId,
} from "@pbh/booking/server";
import type { DetailsState } from "@pbh/booking";

/**
 * Thin `"use server"` wrapper over the shared `completeProfileCore`. The user id
 * comes from the identity seam (`resolveBookingUserId`) rather than being trusted
 * from the form — the single place Clerk will later own.
 */
export async function completeProfile(
  _prev: DetailsState,
  formData: FormData,
): Promise<DetailsState> {
  return completeProfileCore(resolveBookingUserId(formData), formData);
}
