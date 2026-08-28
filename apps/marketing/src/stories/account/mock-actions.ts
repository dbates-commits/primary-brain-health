/**
 * Stand-in server actions for the account-card stories.
 *
 * `ProfileForm` and `DeleteAccountPanel` take their `"use server"` actions as
 * props, which is the seam that lets these stories render the real components
 * without pulling `next/headers` or the database into the Vite bundle. Mirrors
 * `stories/booking/mock-actions.ts`.
 *
 * The delay is deliberate and finite: `useActionState` only reports `pending`
 * while the promise is unsettled, so a story that wants to show the disabled
 * fieldset needs a round-trip to observe — and the Vitest browser run needs it
 * to end.
 */

import type {
  BillingPortalFlow,
  BillingPortalResult,
  OpenBillingPortalAction,
} from "@/lib/billing-portal-flow";
import type { DeleteAccountAction } from "@/lib/delete-account-state";
import {
  readProfileValues,
  type ProfileAction,
  type ProfileValues,
} from "@/lib/profile-values";

/** Long enough to see the pending state, short enough not to stall the test run. */
export const ACTION_DELAY_MS = 600;

/** Used by the "Submitting" story, which parks the form in its pending state. */
export const SLOW_ACTION_DELAY_MS = 4000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function profileSucceeds(delayMs = ACTION_DELAY_MS): ProfileAction {
  return async (_prev, formData) => {
    await delay(delayMs);
    return { status: "success", values: readProfileValues(formData) };
  };
}

export function profileFieldErrors(
  fieldErrors: Record<string, string>,
  delayMs = ACTION_DELAY_MS,
): ProfileAction {
  return async (_prev, formData) => {
    await delay(delayMs);
    return {
      status: "error",
      message: "Please fix the fields below.",
      fieldErrors,
      values: readProfileValues(formData),
    };
  };
}

export function profileFails(
  message: string,
  delayMs = ACTION_DELAY_MS,
): ProfileAction {
  return async (_prev, formData) => {
    await delay(delayMs);
    return { status: "error", message, values: readProfileValues(formData) };
  };
}

/**
 * Succeeds, and hands the raw submitted keys to the caller.
 *
 * `readProfileValues` would paper over the thing the email stories are checking
 * — it only looks for the seven fields it knows about — so this reports what
 * the browser actually put in the payload.
 */
export function profileSpy(
  onSubmit: (keys: string[], values: ProfileValues) => void,
  delayMs = ACTION_DELAY_MS,
): ProfileAction {
  return async (_prev, formData) => {
    await delay(delayMs);
    const values = readProfileValues(formData);
    onSubmit([...formData.keys()], values);
    return { status: "success", values };
  };
}

/**
 * Succeeds once, then fails — the sequence that proves the dirty baseline
 * follows what the database accepted rather than what the page loaded.
 */
export function profileSucceedsThenFails(
  message: string,
  delayMs = ACTION_DELAY_MS,
): ProfileAction {
  let saved = false;
  return async (_prev, formData) => {
    await delay(delayMs);
    const values = readProfileValues(formData);
    if (saved) {
      return { status: "error", message, values };
    }
    saved = true;
    return { status: "success", values };
  };
}

/** Files the request successfully. The panel then signs out, which stories stub. */
export function deleteAccountSucceeds(
  delayMs = ACTION_DELAY_MS,
): DeleteAccountAction {
  return async () => {
    await delay(delayMs);
    return { status: "success" };
  };
}

export function deleteAccountFails(
  message: string,
  delayMs = ACTION_DELAY_MS,
): DeleteAccountAction {
  return async () => {
    await delay(delayMs);
    return { status: "error", message };
  };
}

/**
 * Succeeds, and reports the raw submitted keys. The confirmation checkbox is
 * re-checked on the server, so a story wants to prove it actually reached the
 * payload rather than only that the button was enabled.
 */
export function deleteAccountSpy(
  onSubmit: (keys: string[]) => void,
  delayMs = ACTION_DELAY_MS,
): DeleteAccountAction {
  return async (_prev, formData) => {
    await delay(delayMs);
    onSubmit([...formData.keys()]);
    return { status: "success" };
  };
}

/**
 * Stands in for the portal call, reporting which flow the pressed link asked
 * for. The real action mints a single-use Stripe URL; the panel is what decides
 * where it opens, so a story only needs the flow and a URL to hand back.
 */
export function billingPortalSpy(
  onOpen: (flow: BillingPortalFlow) => void,
  result: BillingPortalResult = { status: "ready", url: PORTAL_URL },
  delayMs = ACTION_DELAY_MS,
): OpenBillingPortalAction {
  return async (flow) => {
    await delay(delayMs);
    onOpen(flow);
    return result;
  };
}

/** Shaped like Stripe's, so a story asserting the opened URL reads honestly. */
export const PORTAL_URL = "https://billing.stripe.com/p/session/test_1U98as";
