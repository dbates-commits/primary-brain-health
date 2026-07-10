"use server";

import { headers } from "next/headers";
import {
  getClientIp,
  hashIp,
  recordConsentCore,
  resolveBookingUserId,
} from "@pbh/booking/server";
import type { ConsentState } from "@pbh/booking";

/**
 * Thin `"use server"` wrapper over the shared `recordConsentCore`. The app reads
 * request metadata (IP hash + user agent) and resolves the user via the identity
 * seam; the append-only consent write itself lives in `@pbh/booking/server`.
 */
export async function recordConsent(
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
