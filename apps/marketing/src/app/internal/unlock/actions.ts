"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClientIp } from "@pbh/booking/server";

import { internalPagesHidden } from "@/lib/internal-gate";
import { consumeUnlockAttempt } from "@/lib/internal-unlock-limit";
import {
  UNLOCK_COOKIE,
  UNLOCK_MAX_AGE_SECONDS,
  safeNext,
  tokensMatch,
  unlockToken,
} from "@/lib/internal-unlock";

export type UnlockState = { error?: string };

/**
 * Checks the shared password and, if it is right, sets the cookie the proxy
 * looks for.
 *
 * Gated like the pages it opens. A server action stays callable after its page
 * 404s, and one that answers "that isn't it" is a guessing oracle on a surface
 * that is supposed to be entirely off.
 *
 * Throttled per IP before the password is even compared: one shared secret with
 * no account behind it has nothing else bounding how many guesses a caller
 * gets. The comparison is of digests, not of the passwords — `tokensMatch`
 * returns early on a length mismatch, which on raw input is the password's
 * length, timed.
 *
 * Deliberately says only "that isn't it": there is one password, so naming what
 * was wrong with the attempt tells an attacker something and the reader
 * nothing.
 */
export async function unlockAction(
  _previous: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  if (internalPagesHidden()) {
    return { error: "Not available on this deployment." };
  }

  const expected = process.env.INTERNAL_PREVIEW_PASSWORD;
  if (!expected) {
    return { error: "No password is set on this deployment." };
  }

  const allowed = await consumeUnlockAttempt(getClientIp(await headers()));
  if (!allowed) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const given = String(formData.get("password") ?? "");
  if (!tokensMatch(await unlockToken(given), await unlockToken(expected))) {
    return { error: "That isn’t it." };
  }

  const store = await cookies();
  store.set(UNLOCK_COOKIE, await unlockToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/internal",
    maxAge: UNLOCK_MAX_AGE_SECONDS,
  });

  redirect(safeNext(String(formData.get("next") ?? "")));
}
