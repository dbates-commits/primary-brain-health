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
 * **The cookie wins, and the session is the fallback.** Both are proofs of
 * identity, but they answer different questions: the session says who is signed
 * in, the cookie says *which booking is in progress*, and only the second is the
 * question these actions are asking. The signup form on the page is rendered
 * whatever the auth state, so a customer who has already paid and is still
 * signed in can start a fresh booking for someone else — that mints a new
 * account and a cookie for it. Preferring the session there would confirm the
 * new address but write the details, consent and payment onto the old account,
 * and hand the customer a resume state belonging to a booking they are not
 * filling in. Ordering it the other way costs nothing in the case the session
 * exists to serve: an aged-out cookie resolves to null, and the fallback runs.
 *
 * Still no fallback to anything the *client* sends. That is the vulnerability
 * the booking cookie exists to close: an attacker controls whether a form field
 * is present, and controls neither of these.
 *
 * Neither proof grants anything on its own — every gate downstream still turns
 * on what has actually been written, and `/welcome` states the same rule as
 * "whichever proves identity, the payment is what grants access".
 *
 * A plain `"server-only"` module rather than a helper inside either actions
 * file: exporting it from a `"use server"` module would publish it as its own
 * action endpoint, and identity resolution is not something to expose.
 */
export async function resolveActorId(): Promise<string | null> {
  const bookingUserId = resolveBookingUserId(await cookies());
  if (bookingUserId) {
    return bookingUserId;
  }
  const session = await auth();
  return session?.user?.id ?? null;
}
