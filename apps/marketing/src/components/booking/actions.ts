"use server";

import { headers } from "next/headers";
import {
  completeProfileCore,
  createAccountCore,
  getClientIp,
  hashIp,
  recordConsentCore,
  resolveBookingUserId,
} from "@pbh/booking/server";
import type { ConsentState, DetailsState, SignupState } from "@pbh/booking";

/**
 * Real per-step server actions for the marketing booking modal (pbh-ggr.5),
 * replacing the `.3` stubs. Each is a thin `"use server"` wrapper over the shared
 * `@pbh/booking/server` cores, reading request metadata and the current user
 * (identity seam) here and delegating the DB writes to the package.
 */

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  return createAccountCore(formData, { source: "marketing-booking" });
}

export async function detailsAction(
  _prev: DetailsState,
  formData: FormData,
): Promise<DetailsState> {
  return completeProfileCore(resolveBookingUserId(formData), formData);
}

export async function consentAction(
  _prev: ConsentState,
  formData: FormData,
): Promise<ConsentState> {
  const requestHeaders = await headers();
  return recordConsentCore({
    userId: resolveBookingUserId(formData),
    agreed: formData.get("agreed") === "on",
    ipHash: hashIp(getClientIp(requestHeaders)),
    userAgent: requestHeaders.get("user-agent"),
  });
}
