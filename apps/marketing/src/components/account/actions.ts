"use server";

import { auth } from "@/auth";
import { createBillingPortalUrl } from "@/lib/billing-portal-core";
import {
  normalizePortalFlow,
  type BillingPortalFlow,
  type BillingPortalResult,
} from "@/lib/billing-portal-flow";
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

/**
 * Mint a Stripe Customer Portal URL for either link on the Payment Details
 * card.
 *
 * Same rule as the two above: identity from the session, never from the
 * argument. The client sends only which flow it wants, and that is re-resolved
 * here rather than trusted.
 *
 * It returns the URL instead of redirecting to it because the card opens Stripe
 * in a new tab — a server-side `redirect` can only replace the current page.
 * The URL is single-use and expires, so it is minted per click and never
 * cached.
 */
export async function openBillingPortalAction(
  flow: BillingPortalFlow,
): Promise<BillingPortalResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      status: "error",
      message: "Your session has expired. Please sign in again.",
    };
  }

  try {
    const url = await createBillingPortalUrl(userId, normalizePortalFlow(flow));

    if (!url) {
      // No succeeded payment — there is no portal to open. The card hides both
      // links in that state, so this is the hand-rolled-call path.
      return {
        status: "error",
        message: "There are no payments on this account yet.",
      };
    }

    return { status: "ready", url };
  } catch (err) {
    // A Stripe outage, or a live key without the Customer portal permission.
    // The real cause goes to the server logs, never to the customer.
    console.error("openBillingPortalAction failed:", err);
    return {
      status: "error",
      message: "We couldn't open your billing details. Please try again.",
    };
  }
}
