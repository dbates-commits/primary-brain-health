import "server-only";

import { cookies } from "next/headers";
import { resolveBookingUserId } from "@pbh/booking/server";
import { auth } from "@/auth";

/**
 * Who is acting in the booking flow: the signed booking cookie, or an Auth.js
 * session behind it.
 *
 * Mid-flow there is normally no session at all — only the HttpOnly cookie issued
 * at signup, which lives two hours. The session is what carries someone whose
 * cookie has aged out and whose 24-hour confirmation link is spent: they sign in
 * again, `/welcome` bounces them back into the flow, and this is what lets the
 * actions recognise them.
 *
 * **Every** booking action must resolve identity through here, including the
 * payment ones, which live in their own module. Give only some of them the
 * fallback and a signed-in customer sees their step and then fails on submit
 * with "we couldn't find your booking" — the exact dead end signing in was meant
 * to fix, just moved one step later.
 *
 * Safe to prefer the session: it is the stronger of the two proofs, having taken
 * a magic link delivered to the address, and it grants nothing on its own. Every
 * gate downstream still turns on what has actually been written — `/welcome`
 * states the same rule as "whichever proves identity, the payment is what grants
 * access".
 *
 * Still no fallback to anything the *client* sends. That is the vulnerability
 * the booking cookie exists to close: an attacker controls whether a form field
 * is present, and controls neither of these.
 *
 * A plain `"server-only"` module rather than a helper inside either actions
 * file: exporting it from a `"use server"` module would publish it as its own
 * action endpoint, and identity resolution is not something to expose.
 */
export async function resolveActorId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? resolveBookingUserId(await cookies());
}
