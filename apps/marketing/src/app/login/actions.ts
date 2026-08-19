"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { auditThrottledSignIn, consumeSignInAttempt } from "@/lib/rate-limit";
import { getClientIp, isValidEmail, normalizeEmail } from "@pbh/booking/server";

export type LoginState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string; email: string };

/**
 * Shown when the address has no account. This one message is the reason the
 * sign-in response is no longer identical for registered and unregistered
 * addresses: it tells an anonymous caller which is which, so anyone can test an
 * email against the customer list. That is a product decision, taken from the
 * design (Figma 1988:10890) — see the "Login-only" section of `docs/auth.md`,
 * which records the trade and the throttling that ought to go with it.
 */
const UNREGISTERED_MESSAGE =
  "Not an active user. Try checking spelling or another email.";

/**
 * Validate an address and send it a magic link. Shared by both entry points —
 * the `/login` page and the header popover — so the two can never drift into
 * different answers for the same address.
 *
 * Never throws for the unregistered case; that comes back as an error state
 * like any other.
 */
async function sendLoginLink(rawEmail: string): Promise<LoginState> {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) {
    return { status: "error", email, message: "Enter a valid email address." };
  }

  // Throttle before Auth.js, not after: the point is to bound how fast the
  // unregistered-address error can be harvested, and that error is produced by
  // `signIn`. A malformed address is rejected above without spending a slot —
  // it never reaches the oracle, so it isn't worth counting.
  const ip = getClientIp(await headers());
  const attempt = await consumeSignInAttempt({ ip, email });
  if (!attempt.allowed) {
    await auditThrottledSignIn(ip, attempt.limit);
    // Deliberately says nothing about which limit was hit or how long is left.
    // "You've tried this address 5 times" would hand back exactly the signal
    // the throttle exists to withhold.
    return {
      status: "error",
      email,
      message: "Too many sign-in attempts. Please try again in a few minutes.",
    };
  }

  try {
    // `redirectTo` is where the magic link lands once redeemed. Without it
    // Auth.js falls back to the Referer header, which only works by accident.
    // /welcome is the terminal screen: it links out to the Linus Engagement
    // App, which is where a returning customer actually wants to be.
    await signIn("magic-link", {
      email,
      redirect: false,
      redirectTo: "/welcome",
    });
  } catch (err) {
    // AccessDenied is our own login-only rejection from the `signIn` callback
    // (see auth.ts) — the address has no account. Anything else is a real
    // provider/config failure; keep its message generic so it leaks nothing
    // about the address or our configuration.
    const isUnregistered =
      err instanceof AuthError && err.type === "AccessDenied";
    return {
      status: "error",
      email,
      message: isUnregistered
        ? UNREGISTERED_MESSAGE
        : "We couldn't start sign-in just now. Please try again.",
    };
  }

  return { status: "sent", email };
}

/**
 * Request a magic-link sign-in from the full-page form at `/login`, which
 * navigates to the check-your-email page on success. The header popover uses
 * {@link requestLoginLinkInline} instead and stays put.
 */
export async function requestMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const result = await sendLoginLink(String(formData.get("email") ?? ""));
  if (result.status !== "sent") {
    return result;
  }

  redirect("/login/check-email");
}

/**
 * Request a magic-link sign-in from the header popover (Figma 1988:9756). Same
 * work as {@link requestMagicLink}, but it reports success as state instead of
 * navigating — the whole point of signing in from the nav is not leaving the
 * page you were reading.
 */
export async function requestLoginLinkInline(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  return sendLoginLink(String(formData.get("email") ?? ""));
}
