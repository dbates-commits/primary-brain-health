"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  UNLOCK_COOKIE,
  UNLOCK_MAX_AGE_SECONDS,
  safeNext,
  unlockToken,
} from "@/lib/internal-unlock";

export type UnlockState = { error?: string };

/**
 * Checks the shared password and, if it is right, sets the cookie the proxy
 * looks for.
 *
 * Deliberately says only "that isn't it": there is one password, so naming
 * what was wrong with the attempt tells an attacker something and the reader
 * nothing.
 */
export async function unlockAction(
  _previous: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const expected = process.env.INTERNAL_PREVIEW_PASSWORD;
  if (!expected) {
    return { error: "No password is set on this deployment." };
  }

  const given = String(formData.get("password") ?? "");
  if (given !== expected) {
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
