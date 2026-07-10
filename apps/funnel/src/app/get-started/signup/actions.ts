"use server";

import { createAccountCore } from "@pbh/booking/server";
import type { SignupState } from "@pbh/booking";

/**
 * Thin `"use server"` wrapper over the shared `createAccountCore`. The account-
 * creation logic lives in `@pbh/booking/server` so the funnel and the marketing
 * booking modal share one implementation; the app only tags its audit `source`.
 */
export async function createAccount(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  return createAccountCore(formData, { source: "get-started" });
}
